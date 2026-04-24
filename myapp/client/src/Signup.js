import React, { useState } from "react";
import axios from "axios";

const API = "https://doctor-appointment-app-86q7.onrender.com";

function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


// ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };


// ================= SIGNUP =================
  const handleSignup = async () => {
    setError("");

    if (!user.name || !user.email || !user.password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/register`, user, {
        timeout: 15000, // helps avoid Render slow response issues
        headers: {
          "Content-Type": "application/json"
        }
      });

      alert(res.data.message || "Signup successful");

      setUser({
        name: "",
        email: "",
        password: ""
      });

    } catch (err) {
      console.log("Signup error:", err?.response?.data || err.message);

      // 🔥 Show real backend error instead of fake "Signup failed"
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Server not reachable. Try again";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


// ================= UI =================
  return (
    <div style={{ padding: 20 }}>
      <h2>Signup</h2>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <input
        name="name"
        placeholder="Name"
        value={user.name}
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="email"
        placeholder="Email"
        value={user.email}
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="password"
        type="password"
        placeholder="Password"
        value={user.password}
        onChange={handleChange}
      />
      <br /><br />

      <button
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}

export default Signup;