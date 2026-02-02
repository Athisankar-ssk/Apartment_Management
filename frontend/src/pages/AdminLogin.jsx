import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AdminLogin.css";

function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (e) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleLogin = async (e) => {
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
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        { email, password }
      );

      console.log("Login response:", res.data);
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminName", res.data.name);
      if (typeof onSuccess === "function") {
        onSuccess();
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.response?.data?.message || "Invalid credentials or server issue";
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
          <h2>Admin Login</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleLogin} className="login-form">
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
            
            <button type="submit" className="btn primary" disabled={loading || !email || !password || !validateEmail(email) || password.length < 6}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
