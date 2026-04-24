import React, { useState, useEffect } from "react";
import axios from "axios";
import Appointments from "./Appointments";
import Signup from "./Signup";

const API = "https://doctor-appointment-app-z2q8.onrender.com";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [doctors, setDoctors] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [refreshAppointments, setRefreshAppointments] = useState(false);

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/api/login`, {
        email: email.toLowerCase().trim(),
        password,
      });

      const newToken = res.data.token;

      localStorage.setItem("token", newToken);
      setToken(newToken);

      alert("Login successful");
    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setDoctors([]);
  };

  // ================= FETCH DOCTORS =================
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/api/doctors`);
      setDoctors(res.data);
    } catch (err) {
      console.log("Doctor fetch error:", err.message);
    }
  };

  // ================= BOOK APPOINTMENT =================
  const handleBook = async (doc) => {
    try {
      const date = prompt("Enter date (YYYY-MM-DD):");
      if (!date) return;

      const selectedDay = new Date(date).toLocaleString("en-US", {
        weekday: "short",
      });

      if (!doc.availability?.days?.includes(selectedDay)) {
        alert(`Doctor not available on ${selectedDay}`);
        return;
      }

      const time = prompt("Enter time (HH:MM)");
      if (!time) return;

      await axios.post(
        `${API}/api/appointments`,
        {
          doctorId: doc._id,
          date,
          time,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Appointment booked successfully");

      // 🔥 IMPORTANT: refresh appointments instantly
      setRefreshAppointments((prev) => !prev);

    } catch (err) {
      console.log("BOOK ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Booking failed");
    }
  };

  // ================= LOAD DOCTORS =================
  useEffect(() => {
    if (token) fetchDoctors();
  }, [token]);

  // ================= SIGNUP =================
  if (showSignup) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setShowSignup(false)}>← Back</button>
        <Signup API={API} />
      </div>
    );
  }

  // ================= LOGIN PAGE =================
  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={handleLogin}>Login</button>

        <br /><br />

        <button onClick={() => setShowSignup(true)}>
          Create Account
        </button>
      </div>
    );
  }

  // ================= MAIN APP =================
  return (
    <div style={{ padding: 20 }}>
      <h1>Doctor Appointment App</h1>

      <button onClick={handleLogout}>Logout</button>

      <h2>Doctors</h2>

      {doctors.length === 0 ? (
        <p>No doctors found</p>
      ) : (
        doctors.map((doc) => (
          <div
            key={doc._id}
            style={{
              border: "1px solid gray",
              padding: 10,
              marginBottom: 10,
            }}
          >
            <h3>{doc.name}</h3>
            <p>
              {doc.specialization} - ₹{doc.fees}
            </p>

            <p>
              <b>Days:</b>{" "}
              {doc.availability?.days?.join(", ") || "N/A"}
            </p>

            <p>
              <b>Time:</b>{" "}
              {doc.availability?.startTime} - {doc.availability?.endTime}
            </p>

            <button onClick={() => handleBook(doc)}>Book</button>
          </div>
        ))
      )}

      <hr />

      {/* 🔥 KEY FIX: refresh trigger passed */}
      <Appointments
        API={API}
        token={token}
        refresh={refreshAppointments}
      />
    </div>
  );
}

export default App;