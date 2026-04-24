import React, { useState } from "react";
import axios from "axios";

// ✅ FIXED API (NO SPACES)
const API =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://doctor-appointment-app-z2q8.onrender.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }

      const res = await axios.post(`${API}/api/login`, {
        email: email.toLowerCase().trim(),
        password
      });

      localStorage.setItem("token", res.data.token);

      alert("Login Successful");

      window.location.reload();

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);

      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;