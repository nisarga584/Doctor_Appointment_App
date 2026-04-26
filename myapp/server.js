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
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

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
  // startTime, endTime will be added dynamically
}));

const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  doctorId: mongoose.Schema.Types.ObjectId,
  date: String,
  time: String,
  status: { type: String, default: "Booked" }
}));

// ================= AUTH =================
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// ================= HELPER =================
function convertToMinutes(time) {
  if (time.includes("AM") || time.includes("PM")) {
    let [t, mod] = time.split(" ");
    let [h, m] = t.split(":");
    h = parseInt(h);
    m = parseInt(m);

    if (mod === "PM" && h !== 12) h += 12;
    if (mod === "AM" && h === 12) h = 0;

    return h * 60 + m;
  } else {
    let [h, m] = time.split(":");
    return parseInt(h) * 60 + parseInt(m);
  }
}

// ================= ROUTES =================

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hash });
  res.json({ message: "Signup successful" });
});

// Login
app.post("/api/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const ok = await bcrypt.compare(req.body.password, user.password);

  if (!ok) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, userId: user._id });
});

// Doctors
app.get("/api/doctors", async (req, res) => {
  const doctors = await Doctor.find();
  res.json(doctors);
});

// ================= BOOK APPOINTMENT =================
app.post("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    // ❌ Past date check
    const today = new Date();
    const selected = new Date(date);
    today.setHours(0,0,0,0);
    selected.setHours(0,0,0,0);

    if (selected < today) {
      return res.status(400).json({ message: "Cannot book past date" });
    }

    // ❌ Doctor check
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // ❌ Ensure doctor timing exists
    if (!doctor.startTime || !doctor.endTime) {
      return res.status(400).json({
        message: "Doctor timing not set"
      });
    }

    // ✅ Convert times
    const bookingTime = convertToMinutes(time);
    const startTime = convertToMinutes(doctor.startTime);
    const endTime = convertToMinutes(doctor.endTime);

    // ❌ Check doctor availability
    if (bookingTime < startTime || bookingTime >= endTime) {
      return res.status(400).json({
        message: `Doctor available only between ${doctor.startTime} and ${doctor.endTime}`
      });
    }

    // ❌ 30-min gap rule
    const existingAppointments = await Appointment.find({ doctorId, date });

    for (let appt of existingAppointments) {
      const existingTime = convertToMinutes(appt.time);
      const diff = Math.abs(existingTime - bookingTime);

      if (diff < 30) {
        return res.status(400).json({
          message: "Slot unavailable (30 min gap rule)"
        });
      }
    }

    // ✅ Create appointment
    const appointment = await Appointment.create({
      userId: req.user.id,
      doctorId,
      date,
      time
    });

    res.json({ message: "Appointment booked successfully", appointment });

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

// Cancel
app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ message: "Cancelled" });
});

// ================= SERVER =================
app.listen(5000, () => console.log("Server running"));