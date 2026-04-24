import express from "express";
import Doctor from "../models/Doctor.js";

const router = express.Router();


// ✅ 1. ADD DOCTOR
router.post("/add-doctor", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();

    res.status(201).json({
      message: "Doctor added successfully",
      doctor: savedDoctor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ 2. GET ALL DOCTORS
router.get("/all-doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ 3. GET SINGLE DOCTOR
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ 4. UPDATE DOCTOR (UPDATED API)
router.put("/update-doctor/:id", async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }   // return updated data
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ 5. DELETE DOCTOR
router.delete("/delete-doctor/:id", async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;