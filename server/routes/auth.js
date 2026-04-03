const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (firstName,lastName,email,password,role) VALUES (?,?,?,?,?)",
        [firstName, lastName, email, hashedPassword, role],
        (err) => {
            if (err) return res.status(400).json(err);
            res.json({ message: "User Registered Successfully" });
        }
    );
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err || result.length === 0)
            return res.status(400).json({ message: "User not found" });

        const valid = await bcrypt.compare(password, result[0].password);
        if (!valid)
            return res.status(400).json({ message: "Invalid password" });

        res.json({ message: "Login successful", user: result[0] });
    });
});

module.exports = router;
