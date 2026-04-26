import React, { useEffect, useState } from "react";
import axios from "axios";

// Backend URL
const API = "https://doctor-appointment-app-z2q8.onrender.com";

function Appointments({ token }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedToken = token || localStorage.getItem("token");

  // ================= FETCH APPOINTMENTS =================
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API}/api/appointments`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      setAppointments(res.data || []);
    } catch (error) {
      console.log("Fetch error:", error?.response?.data || error.message);

      setError(
        error?.response?.data?.message ||
        "Failed to load appointments"
      );

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= CANCEL APPOINTMENT =================
  const handleCancel = async (id) => {
    try {
      setError("");

      await axios.delete(`${API}/api/appointments/${id}`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      setAppointments((prev) =>
        prev.filter((appt) => appt._id !== id)
      );

      alert("Appointment cancelled successfully");

    } catch (error) {
      console.log("Cancel error:", error?.response?.data || error.message);

      setError(
        error?.response?.data?.message ||
        "Failed to cancel appointment"
      );
    }
  };

  // ================= LOAD DATA =================
  useEffect(() => {
    if (storedToken) {
      fetchAppointments();
    } else {
      setAppointments([]);
      setLoading(false);
      setError("Please login to view appointments");
    }
  }, [token]);

  // ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      <h2>My Appointments</h2>

      {!storedToken ? (
        <p>Please login to view appointments</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
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
            <p><strong>Doctor:</strong> {appt.doctorId?.name || "N/A"}</p>
            <p><strong>Specialization:</strong> {appt.doctorId?.specialization || "N/A"}</p>
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
}

export default Appointments;