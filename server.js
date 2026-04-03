const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://admin:Takurmukku%4044@cluster0.bovsibb.mongodb.net/hospital_system?retryWrites=true&w=majority")
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));

// REGISTER
app.post("/register", async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = new User(req.body);
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email,
            password: req.body.password
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", user });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log("Server running on http://localhost:5000");
});