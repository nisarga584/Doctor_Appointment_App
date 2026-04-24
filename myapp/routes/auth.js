const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// POST /api/register
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // ✅ 1. Check missing fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    // ✅ 2. Normalize email
    email = email.toLowerCase().trim();

    // ✅ 3. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // ✅ 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 5. Create user
    const user = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
    });

    await user.save();

    // ✅ 6. Success response
    return res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({
      message: "Server error"
    });
  }
});

module.exports = router;