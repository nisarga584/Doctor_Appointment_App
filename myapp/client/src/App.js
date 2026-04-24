import React, { useState, useEffect } from "react";
import axios from "axios";
import Appointments from "./Appointments";
import Signup from "./Signup";

const API = "https://doctor-appointment-app-86q7.onrender.com";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [doctors, setDoctors] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  // ================= LOGIN =================
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API}/api/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      alert("Login successful");
    } catch (err) {
      console.log(err);
      alert("Login failed");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  // ================= FETCH DOCTORS =================
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/api/doctors`);
      setDoctors(res.data);
    } catch (err) {
      console.log("Error fetching doctors:", err);
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
        alert(`Doctor is NOT available on ${selectedDay}`);
        return;
      }

      const time = prompt("Enter time (HH:MM):");
      if (!time) return;

      const [h, m] = time.split(":").map(Number);
      const userMinutes = h * 60 + m;

      const convertToMinutes = (t) => {
        let [timePart, modifier] = t.split(" ");
        let [hours, minutes] = timePart.split(":").map(Number);

        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        return hours * 60 + minutes;
      };

      const start = convertToMinutes(doc.availability.startTime);
      const end = convertToMinutes(doc.availability.endTime);

      if (userMinutes < start || userMinutes > end) {
        alert("Time outside doctor's availability");
        return;
      }

      await axios.post(
        `${API}/api/appointments`,
        { doctorId: doc._id, date, time },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Appointment booked successfully");
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error booking");
    }
  };

  // ================= EFFECT =================
  useEffect(() => {
    if (token) {
      fetchDoctors();
    }
  }, [token]);

  // ================= SIGNUP PAGE =================
  if (showSignup) {
    return (
      <div style={{ padding: 20 }}>
        <button onClick={() => setShowSignup(false)}>← Back to Login</button>
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
          Create New Account
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
        <p>Loading doctors...</p>
      ) : (
        doctors.map((doc) => (
          <div
            key={doc._id}
            style={{
              border: "1px solid gray",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <h3>{doc.name}</h3>
            <p>{doc.specialization} - ₹{doc.fees}</p>

            <p>
              <b>Available Days:</b>{" "}
              {doc.availability?.days?.join(", ") || "Not set"}
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

      <Appointments API={API} token={token} />
    </div>
  );
}

export default App;