const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();


// ================= CORS =================
app.use(cors({
  origin: [
    "https://doctor-appointment-app-b7z8.vercel.app",
    "http://localhost:5000"
  ],
  credentials: true
}));


// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= MONGODB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });


// ================= MODELS =================

// USER
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);


// DOCTOR
const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  experience: Number,
  fees: Number,
  availability: {
    days: [String],
    startTime: String,
    endTime: String
  }
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", doctorSchema);


// APPOINTMENT
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  date: String,
  time: String,
  status: { type: String, default: "Booked" }
}, { timestamps: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);


// ================= AUTH MIDDLEWARE =================
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
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// ================= TEST =================
app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});


// ================= AUTH =================

// SIGNUP
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({
      message: "Signup successful"
    });

  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({
      message: "Signup failed",
      error: err.message
    });
  }
});


// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({
      message: "Login failed",
      error: err.message
    });
  }
});


// ================= DOCTORS =================
app.post("/api/doctors", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: "Error adding doctor" });
  }
});

app.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctors" });
  }
});


// ================= APPOINTMENTS =================

// BOOK
app.post("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    const newTime = new Date(`${date}T${time}`);

    const existing = await Appointment.find({ doctorId, date });

    for (let appt of existing) {
      const oldTime = new Date(`${appt.date}T${appt.time}`);
      const diff = Math.abs((newTime - oldTime) / (1000 * 60));

      if (diff < 30) {
        return res.status(400).json({
          message: "Slot already booked or within 30 minutes"
        });
      }
    }

    const appointment = new Appointment({
      userId: req.user.id,
      doctorId,
      date,
      time
    });

    await appointment.save();

    res.json({
      message: "Appointment booked successfully",
      appointment
    });

  } catch (err) {
    res.status(500).json({
      message: "Booking failed",
      error: err.message
    });
  }
});


// GET APPOINTMENTS
app.get("/api/appointments", authMiddleware, async (req, res) => {
  try {
    const data = await Appointment.find({ userId: req.user.id })
      .populate("doctorId");

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching appointments"
    });
  }
});


// CANCEL
app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt || appt.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized"
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      message: "Appointment cancelled"
    });

  } catch (err) {
    res.status(500).json({
      message: "Cancel failed"
    });
  }
});


// ================= SERVER =================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});