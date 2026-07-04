import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate("/dashboard");
    } catch (error) {
      alert(
        "Login Failed: " +
          (error.response?.data?.message || "Check credentials")
      );
    }
  };

  return (
    <div className="auth-pro-page">
      

      <form className="auth-pro-card" onSubmit={handleLogin}>
        <p className="auth-small-title">Welcome back 👋</p>
        <h2>Login to your account</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-main-btn" type="submit">
          Login
        </button>

        <p className="auth-switch-text">
          Don&apos;t have an account?
          <span onClick={() => navigate("/register")}> Register</span>
        </p>
      </form>
    </div>
  );
};

export default Login;