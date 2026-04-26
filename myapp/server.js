const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// ================= CORS CONFIG =================
const allowedOrigins = [
  "http://localhost:3000",
  "https://doctor-appointment-app-topaz-tau.vercel.app",
  "https://doctor-appointment-app-vuyl.vercel.app",
  "https://doctor-appointment-app-b7z8.vercel.app",
  "https://doctor-appointment-app-7jpf.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// ================= MIDDLEWARE =================
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err.message));

// ================= MODELS =================
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}));

const Doctor = mongoose.model("Doctor", new mongoose.Schema({
  name: String,
  specialization: String,
  experience: Number,
  fees: Number
}));

const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  date: String,
  time: String,
  status: { type: String, default: "Booked" }
}));

// ================= AUTH =================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= TEST =================
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// ================= REGISTER =================
app.post("/api/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    email = email.toLowerCase().trim();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "Signup successful" });

  } catch {
    res.status(500).json({ message: "Signup failed" });
  }
});

// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({ message: "Login successful", token, userId: user._id });

  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

// ================= GET DOCTORS =================
app.get("/api/doctors", async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// ================= HELPER FUNCTION =================
function convertToMinutes(time) {
  if (!time || typeof time !== "string") return null;

  if (time.includes("AM") || time.includes("PM")) {
    let [t, modifier] = time.split(" ");
    if (!t || !modifier) return null;

    let [h, m] = t.split(":");
    if (!h || !m) return null;

    let hours = parseInt(h);
    let minutes = parseInt(m);

    if (isNaN(hours) || isNaN(minutes)) return null;

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return hours * 60 + minutes;
  } else {
    let [h, m] = time.split(":");
    let hours = parseInt(h);
    let minutes = parseInt(m);

    if (isNaN(hours) || isNaN(minutes)) return null;

    return hours * 60 + minutes;
  }
}

// ================= BOOK APPOINTMENT =================
app.post("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    if (!time) {
      return res.status(400).json({ message: "Invalid time selected" });
    }

    // Normalize time
    let formattedTime = time.trim();
    if (!formattedTime.includes("AM") && !formattedTime.includes("PM")) {
      let [h, m] = formattedTime.split(":");
      let hour = parseInt(h);
      formattedTime = hour >= 12 ? `${hour}:${m} PM` : `${hour}:${m} AM`;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Cannot book past dates"
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const bookingTime = convertToMinutes(formattedTime);
    const startTime = convertToMinutes(doctor.startTime);
    const endTime = convertToMinutes(doctor.endTime);

    if (bookingTime === null || startTime === null || endTime === null) {
      return res.status(400).json({
        message: "Invalid time format"
      });
    }

    // ================= STEP 1: SLOT CHECK =================
    const appointments = await Appointment.find({ doctorId, date });

    for (let appt of appointments) {
      const existing = convertToMinutes(appt.time);

      if (existing !== null && Math.abs(existing - bookingTime) < 30) {
        return res.status(400).json({
          message: "Slot has already been booked, try different timing"
        });
      }
    }

    // ================= STEP 2: AVAILABILITY =================
    if (!doctor.startTime || !doctor.endTime) {
      return res.status(400).json({
        message: "Doctor is unavailable at this time"
      });
    }

    if (bookingTime < startTime || bookingTime >= endTime) {
      return res.status(400).json({
        message: "Doctor is unavailable at this time"
      });
    }

    // ================= CREATE =================
    const appointment = await Appointment.create({
      userId: req.user.id,
      doctorId,
      date,
      time: formattedTime,
      status: "Booked"
    });

    res.json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Booking failed" });
  }
});

// ================= GET APPOINTMENTS =================
app.get("/api/appointments", authMiddleware, async (req, res) => {
  const data = await Appointment.find({ userId: req.user.id })
    .populate("doctorId");
  res.json(data);
});

// ================= CANCEL =================
app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Cancelled" });
});

// ================= SERVER =================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});