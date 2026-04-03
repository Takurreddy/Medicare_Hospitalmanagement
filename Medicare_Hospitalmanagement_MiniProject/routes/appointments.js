const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/book", (req, res) => {
    const { patientId, doctorId, specialty, date, time, reason } = req.body;

    db.query(
        "INSERT INTO appointments (patientId, doctorId, specialty, date, time, reason) VALUES (?,?,?,?,?,?)",
        [patientId, doctorId, specialty, date, time, reason],
        (err) => {
            if (err) return res.status(400).json(err);
            res.json({ message: "Appointment Booked" });
        }
    );
});

router.get("/:id", (req, res) => {
    db.query(
        "SELECT * FROM appointments WHERE patientId = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(400).json(err);
            res.json(result);
        }
    );
});

module.exports = router;
