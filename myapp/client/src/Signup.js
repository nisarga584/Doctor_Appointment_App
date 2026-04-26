import React, { useState } from "react";
import axios from "axios";
const API = "https://doctor-appointment-app-z2q8.onrender.com";
function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //HANDLE INPUT
  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  //SIGNUP
  const handleSignup = async () => {
    setError("");

    //Trim + normalize
    const formattedUser = {
      name: user.name.trim(),
      email: user.email.toLowerCase().trim(),
      password: user.password.trim()
    };

    //Validation
    if (!formattedUser.name || !formattedUser.email || !formattedUser.password) {
      setError("All fields are required");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(
        `${API}/api/register`,
        formattedUser,
        {
          timeout: 15000,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      alert(res.data.message || "Signup successful");
      //Reset form
      setUser({
        name: "",
        email: "",
        password: ""
      });
    } catch (err) {
      console.log("Signup error:", err);

      //Better error handling
      if (err.code === "ECONNABORTED") {
        setError("Server is slow (Render cold start). Try again.");
      } else if (err.response) {
        setError(err.response.data?.message || "Signup failed");
      } else {
        setError("Server not reachable");
      }

    } finally {
      setLoading(false);
    }
  };

  //UI 
  return (
    <div style={{ padding: 20 }}>
      <h2>Signup</h2>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
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
        type="email"
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
      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </div>
  );
}
export default Signup;