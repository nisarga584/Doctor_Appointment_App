const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

//REGISTER 
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    //Normalize input
    name = name.trim();
    email = email.toLowerCase().trim();

    //Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Save user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    await user.save();

    //Response
    return res.status(201).json({
      message: "User registered successfully"
    });

  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({
      message: "Server error"
    });
  }
});
module.exports = router;