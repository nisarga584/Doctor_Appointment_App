import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ AUTO SWITCH API (LOCAL + PRODUCTION)
const API =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : " https://doctor-appointment-app-z2q8.onrender.com";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API}/api/doctors`);
        setDoctors(res.data);
      } catch (err) {
        console.log("Error fetching doctors:", err);
      }
    };

    fetchDoctors();
  }, []);

  // ✅ BOOK APPOINTMENT
  const bookAppointment = async (doctorId) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await axios.post(
        `${API}/api/appointments`,
        {
          doctorId,
          date: "2026-04-10",
          time: "10:00"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(res.data.message || "Appointment Booked");
    } catch (err) {
      console.log("Booking error:", err);
      alert(err.response?.data?.message || "Booking Failed");
    }
  };

  return (
    <div>
      <h2>Doctors List</h2>

      {doctors.length === 0 ? (
        <p>No doctors available</p>
      ) : (
        doctors.map((doc) => (
          <div
            key={doc._id}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px"
            }}
          >
            <h3>{doc.name}</h3>
            <p>Specialization: {doc.specialization}</p>
            <p>Experience: {doc.experience} years</p>
            <p>Fees: ₹{doc.fees}</p>

            <button onClick={() => bookAppointment(doc._id)}>
              Book Appointment
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Doctors;