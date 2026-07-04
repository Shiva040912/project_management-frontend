import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        email,
        password,
        role,
      });

      alert("Registration Successful!");
      navigate("/login");
    } catch (error) {
      alert(
        "Registration Failed: " +
          (error.response?.data?.message || "Error")
      );
    }
  };

  return (
    <div className="auth-pro-page">
      
      <form className="auth-pro-card" onSubmit={handleRegister}>
        <p className="auth-small-title">Start your journey 🚀</p>
        <h2>Create account</h2>

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Create password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>

        <button className="auth-main-btn" type="submit">
          Create Account
        </button>

        <p className="auth-switch-text">
          Already have an account?
          <span onClick={() => navigate("/login")}> Login</span>
        </p>
      </form>
    </div>
  );
};

export default Register;