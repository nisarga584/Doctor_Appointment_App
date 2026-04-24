import React, { useEffect, useState } from "react";
import axios from "axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching appointments:", error);
      setLoading(false);
    }
  };

  // Cancel appointment
  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Appointment cancelled ✅");
      setAppointments((prev) => prev.filter((appt) => appt._id !== id));
    } catch (error) {
      console.log("Error cancelling appointment:", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>My Appointments</h2>
      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found</p>
      ) : (
        appointments.map((appt) => (
          <div
            key={appt._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <p><strong>Doctor:</strong> {appt.doctorId?.name}</p>
            <p><strong>Specialization:</strong> {appt.doctorId?.specialization}</p>
            <p><strong>Date:</strong> {appt.date}</p>
            <p><strong>Time:</strong> {appt.time}</p>
            <p><strong>Status:</strong> {appt.status}</p>
            <button
              onClick={() => handleCancel(appt._id)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              Cancel Appointment
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Appointments;