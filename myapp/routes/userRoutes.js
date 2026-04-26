import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
const router = express.Router();

//REGISTER 
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    //Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    //Normalize email
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
      name: name.trim(),
      email,
      password: hashedPassword
    });
    await user.save();
    res.status(201).json({
      message: "User registered successfully"
    });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({
      message: "Server error"
    });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    //Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }
    email = email.toLowerCase().trim();

    //Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    //Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    //Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({
      message: "Login successful",
      token,
      userId: user._id
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({
      message: "Login failed"
    });
  }
});
export default router;