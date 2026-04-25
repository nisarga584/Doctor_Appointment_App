const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();


// ================= CORS CONFIG (FIXED) =================
const allowedOrigins = [
  "http://localhost:3000",
  "https://doctor-appointment-app-topaz-tau.vercel.app",
  "https://doctor-appointment-app-vuyl.vercel.app",
  "https://doctor-appointment-app-b7z8.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow mobile apps / server-to-server / Postman
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ CORS blocked:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};


// ================= MIDDLEWARE =================
app.use(cors(corsOptions));

// IMPORTANT: handle preflight requests properly
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);


// ================= DB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ Mongo Error:", err.message));


// ================= MODELS =================
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}, { timestamps: true }));

const Doctor = mongoose.model("Doctor", new mongoose.Schema({
  name: String,
  specialization: String,
  experience: Number,
  fees: Number
}, { timestamps: true }));

const Appointment = mongoose.model("Appointment", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  date: String,
  time: String,
  status: { type: String, default: "Booked" }
}, { timestamps: true }));


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


// ================= TEST ROUTE =================
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
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

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup failed" });
  }
});


// ================= LOGIN =================
app.post("/api/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    email = email.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

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
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
});


// ================= DOCTORS =================
app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    console.log("Doctors from DB:", doctors);
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch doctors" });
  }
});


// ================= APPOINTMENTS =================
app.post("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    const appointment = await Appointment.create({
      userId: req.user.id,
      doctorId,
      date,
      time,
      status: "Booked"
    });

    res.json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
});


// ================= GET APPOINTMENTS =================
app.get("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const data = await Appointment.find({ userId: req.user.id })
      .populate("doctorId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
});


// ================= CANCEL =================
app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Cancel failed" });
  }
});


// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port " + PORT);
});