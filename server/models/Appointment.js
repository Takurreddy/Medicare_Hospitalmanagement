const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        specialty: { type: String, required: true, trim: true },
        date: { type: String, required: true },
        time: { type: String, required: true },
        reason: { type: String, default: "", trim: true },
        status: {
            type: String,
            enum: ["pending", "confirmed", "rejected"],
            default: "pending"
        }
    },
    { timestamps: true }
);

appointmentSchema.index({ patientId: 1, createdAt: -1 });
appointmentSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
