import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // ✅ validation
      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }

      // ✅ normalize email
      const formattedEmail = email.toLowerCase().trim();

      // ✅ IMPORTANT: change URL if deployed
      const res = await axios.post(
        "http://localhost:5000/api/login",
        {
          email: formattedEmail,
          password
        }
      );

      // ✅ store token
      localStorage.setItem("token", res.data.token);

      alert("Login Successful");

    } catch (err) {
      console.error("Login error:", err);

      // ✅ show real backend message
      if (err.response && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("Server error");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Enter Email"
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />

      <input
        type="password"
        placeholder="Enter Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;