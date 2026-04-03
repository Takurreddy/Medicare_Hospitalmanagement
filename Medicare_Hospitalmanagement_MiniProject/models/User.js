const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, default: "" },
        age: { type: Number, default: null },
        gender: { type: String, default: "" },
        role: { type: String, enum: ["patient", "doctor"], required: true },
        password: { type: String, required: true },
        specialty: { type: String, default: null }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
