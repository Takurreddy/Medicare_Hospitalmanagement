const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

const connectDB = require("./db");
const User = require("./models/User");
const Appointment = require("./models/Appointment");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));

const VALID_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const VALID_STATUS = ["pending", "confirmed", "rejected"];
const JWT_SECRET = process.env.JWT_SECRET || "change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function getId(value) {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (value._id) return value._id.toString();
    if (value.id) return value.id.toString();
    return null;
}

function toPublicUser(user) {
    if (!user) return null;

    return {
        id: getId(user),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        age: user.age ?? null,
        gender: user.gender || "",
        role: user.role,
        specialty: user.specialty || null,
        availability: {
            days: Array.isArray(user.availability?.days) ? user.availability.days : [],
            slots: Array.isArray(user.availability?.slots) ? user.availability.slots : []
        }
    };
}

function toAppointmentResponse(appointment) {
    const doctor = appointment.doctorId && typeof appointment.doctorId === "object" ? toPublicUser(appointment.doctorId) : null;
    const patient = appointment.patientId && typeof appointment.patientId === "object" ? toPublicUser(appointment.patientId) : null;

    return {
        id: getId(appointment),
        patientId: patient?.id || getId(appointment.patientId),
        doctorId: doctor?.id || getId(appointment.doctorId),
        specialty: appointment.specialty,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        doctor,
        patient
    };
}

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

function generateToken(user) {
    return jwt.sign(
        {
            sub: getId(user),
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function getBearerToken(req) {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return null;
    return authHeader.slice("Bearer ".length).trim();
}

async function requireAuth(req, res, next) {
    try {
        const token = getBearerToken(req);

        if (!token) {
            return res.status(401).json({ message: "Authentication token missing" });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.sub;

        if (!isValidObjectId(userId)) {
            return res.status(401).json({ message: "Invalid authentication token" });
        }

        const user = await User.findById(userId).select("-password").lean();

        if (!user) {
            return res.status(401).json({ message: "User not found for token" });
        }

        req.auth = {
            userId: getId(user),
            role: user.role
        };
        req.user = toPublicUser(user);
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid or expired token" });
        }

        return res.status(500).json({ message: error.message });
    }
}

function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.auth || !allowedRoles.includes(req.auth.role)) {
            return res.status(403).json({ message: "Access denied for this role" });
        }
        next();
    };
}

app.get("/health", (_req, res) => {
    res.json({ ok: true });
});

app.get("/", (_req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.get("/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
});

app.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, email, password, role, phone, age, gender, specialty } = req.body;

        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (!["patient", "doctor"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (role === "doctor" && !specialty) {
            return res.status(400).json({ message: "Specialty is required for doctors" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            phone: phone || "",
            age: age || null,
            gender: gender || "",
            specialty: role === "doctor" ? specialty.trim() : null,
            availability: role === "doctor"
                ? { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], slots: ["09:00", "10:00", "11:00"] }
                : { days: [], slots: [] }
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: toPublicUser(newUser)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        let passwordMatch = await bcrypt.compare(password, user.password);

        // Backward compatibility for previously stored plain-text passwords.
        if (!passwordMatch && user.password === password) {
            passwordMatch = true;
            user.password = await bcrypt.hash(password, 10);
            await user.save();
        }

        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            user: toPublicUser(user),
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/doctors", requireAuth, async (req, res) => {
    try {
        const { specialty } = req.query;
        const query = { role: "doctor" };

        if (specialty) {
            query.specialty = { $regex: `^${specialty}$`, $options: "i" };
        }

        const doctors = await User.find(query)
            .sort({ firstName: 1, lastName: 1 })
            .select("-password")
            .lean();

        res.json({ doctors: doctors.map(toPublicUser) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch("/doctors/:doctorId/availability", requireAuth, requireRole(["doctor"]), async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { days, slots } = req.body;

        if (!isValidObjectId(doctorId)) {
            return res.status(400).json({ message: "Invalid doctor id" });
        }

        if (req.auth.userId !== doctorId) {
            return res.status(403).json({ message: "You can update only your own availability" });
        }

        const normalizedDays = Array.isArray(days)
            ? [...new Set(days.map((day) => String(day).trim()))].filter((day) => VALID_DAYS.includes(day))
            : [];

        const normalizedSlots = Array.isArray(slots)
            ? [...new Set(slots.map((slot) => String(slot).trim()).filter(Boolean))]
            : [];

        const updatedDoctor = await User.findOneAndUpdate(
            { _id: doctorId, role: "doctor" },
            { availability: { days: normalizedDays, slots: normalizedSlots } },
            { new: true }
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.json({
            message: "Availability saved",
            doctor: toPublicUser(updatedDoctor)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/appointments", requireAuth, requireRole(["patient"]), async (req, res) => {
    try {
        const { doctorId, date, time, reason } = req.body;
        const patientId = req.auth.userId;

        if (!doctorId || !date || !time || !reason) {
            return res.status(400).json({ message: "Missing required appointment fields" });
        }

        if (!isValidObjectId(patientId) || !isValidObjectId(doctorId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        const [patient, doctor] = await Promise.all([
            User.findOne({ _id: patientId, role: "patient" }).lean(),
            User.findOne({ _id: doctorId, role: "doctor" }).lean()
        ]);

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        const conflictingAppointment = await Appointment.findOne({
            doctorId,
            date,
            time,
            status: { $in: ["pending", "confirmed"] }
        });

        if (conflictingAppointment) {
            return res.status(409).json({ message: "Selected slot is already booked for this doctor" });
        }

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            specialty: doctor.specialty || "General",
            date,
            time,
            reason: reason.trim(),
            status: "pending"
        });

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("doctorId", "firstName lastName email phone age gender role specialty availability")
            .populate("patientId", "firstName lastName email phone age gender role specialty availability")
            .lean();

        res.status(201).json({
            message: "Appointment booked",
            appointment: toAppointmentResponse(populatedAppointment)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/appointments/patient/:patientId", requireAuth, requireRole(["patient"]), async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!isValidObjectId(patientId)) {
            return res.status(400).json({ message: "Invalid patient id" });
        }

        if (req.auth.userId !== patientId) {
            return res.status(403).json({ message: "You can access only your own appointments" });
        }

        const appointments = await Appointment.find({ patientId })
            .sort({ createdAt: -1 })
            .populate("doctorId", "firstName lastName email phone age gender role specialty availability")
            .populate("patientId", "firstName lastName email phone age gender role specialty availability")
            .lean();

        res.json({ appointments: appointments.map(toAppointmentResponse) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get("/appointments/doctor/:doctorId", requireAuth, requireRole(["doctor"]), async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!isValidObjectId(doctorId)) {
            return res.status(400).json({ message: "Invalid doctor id" });
        }

        if (req.auth.userId !== doctorId) {
            return res.status(403).json({ message: "You can access only your own appointments" });
        }

        const appointments = await Appointment.find({ doctorId })
            .sort({ createdAt: -1 })
            .populate("doctorId", "firstName lastName email phone age gender role specialty availability")
            .populate("patientId", "firstName lastName email phone age gender role specialty availability")
            .lean();

        res.json({ appointments: appointments.map(toAppointmentResponse) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch("/appointments/:appointmentId/status", requireAuth, requireRole(["doctor"]), async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;
        const doctorId = req.auth.userId;

        if (!status) {
            return res.status(400).json({ message: "status is required" });
        }

        if (!isValidObjectId(appointmentId)) {
            return res.status(400).json({ message: "Invalid id" });
        }

        if (!VALID_STATUS.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.doctorId.toString() !== doctorId) {
            return res.status(403).json({ message: "Only assigned doctor can update this appointment" });
        }

        appointment.status = status;
        await appointment.save();

        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate("doctorId", "firstName lastName email phone age gender role specialty availability")
            .populate("patientId", "firstName lastName email phone age gender role specialty availability")
            .lean();

        res.json({
            message: "Appointment status updated",
            appointment: toAppointmentResponse(populatedAppointment)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = 5000;

async function startServer() {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();
