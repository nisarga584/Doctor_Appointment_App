import React, { useEffect, useState } from "react";
import axios from "axios";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/doctors");
        setDoctors(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctors();
  }, []);

  // ✅ BOOK APPOINTMENT FUNCTION
  const bookAppointment = async (doctorId) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/appointments",
        {
          doctorId,
          date: "2026-04-10",
          time: "10:00 AM"
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
          }
        }
      );

      alert("Appointment Booked ✅");
    } catch (err) {
      console.log(err);
      alert("Booking Failed ❌");
    }
  };

  return (
    <div>
      <h2>Doctors List</h2>

      {doctors.map((doc) => (
        <div key={doc._id} style={{ border: "1px solid black", margin: "10px", padding: "10px" }}>
          <h3>{doc.name}</h3>
          <p>Specialization: {doc.specialization}</p>
          <p>Experience: {doc.experience} years</p>
          <p>Fees: ₹{doc.fees}</p>

          {/* ✅ BUTTON ADDED */}
          <button onClick={() => bookAppointment(doc._id)}>
            Book Appointment
          </button>
        </div>
      ))}
    </div>
  );
}

export default Doctors;