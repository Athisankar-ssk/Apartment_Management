import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const name = localStorage.getItem("adminName");
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("Fetching stats with token:", token ? "Token exists" : "No token");
      const res = await axios.get(
        "http://localhost:5000/api/admin/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Stats response:", res.data);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      console.error("Error response:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleUserCountClick = () => {
    navigate("/user-management");
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Welcome, {name}</h1>
        </header>

        <section className="admin-grid">
          <div 
            className="card stat-card clickable"
            onClick={handleUserCountClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleUserCountClick();
            }}
          >
            <h3>Total Users</h3>
            <div className="stat">{loading ? "..." : stats.totalUsers}</div>
            <p className="stat-description">Registered apartment users</p>
          </div>
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
