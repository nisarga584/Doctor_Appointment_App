import express from "express";
import Doctor from "../models/Doctor.js";
const router = express.Router();

//ADD DOCTOR 
router.post("/", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.status(201).json({
      message: "Doctor added successfully",
      doctor: savedDoctor
    });
  } catch (error) {
    console.error("Add doctor error:", error.message);
    res.status(500).json({ message: "Error adding doctor" });
  }
});

//GET ALL DOCTORS 
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error("Fetch doctors error:", error.message);
    res.status(500).json({ message: "Error fetching doctors" });
  }
});

//GET SINGLE DOCTOR
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (error) {
    console.error("Get doctor error:", error.message);
    res.status(500).json({ message: "Error fetching doctor" });
  }
});

//UPDATE DOCTOR 
router.put("/:id", async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor
    });
  } catch (error) {
    console.error("Update doctor error:", error.message);
    res.status(500).json({ message: "Error updating doctor" });
  }
});

//DELETE DOCTOR
router.delete("/:id", async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error.message);
    res.status(500).json({ message: "Error deleting doctor" });
  }
});
export default router;