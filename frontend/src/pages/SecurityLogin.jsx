import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminLogin.css";

function SecurityLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (e) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/security/login", { 
        email, 
        password 
      });

      localStorage.setItem("securityToken", res.data.token);
      localStorage.setItem("securityName", res.data.name);
      localStorage.setItem("securityId", res.data.securityId);
      navigate("/security/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="login-page">
        <div className="login-card">
          <h2>Security Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
              {!validateEmail(email) && email.length > 0 && (
                <div className="field-error">Enter a valid email.</div>
              )}
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              {password.length > 0 && password.length < 6 && (
                <div className="field-error">Password must be 6+ characters.</div>
              )}
            </div>
            <button 
              type="submit" 
              className="btn primary" 
              disabled={loading || !email || !password || !validateEmail(email) || password.length < 6}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default SecurityLogin;
