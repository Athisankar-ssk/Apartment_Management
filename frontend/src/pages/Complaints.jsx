import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../pages/AdminDashboard.css";

function Complaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        "http://localhost:5000/api/complaints/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical": return "#ef4444";
      case "high": return "#f97316";
      case "medium": return "#eab308";
      case "low": return "#22c55e";
      default: return "#6b7280";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredComplaints = filter === "all" 
    ? complaints 
    : complaints.filter(c => c.status === filter);

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>All Complaints</h1>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select 
              className="form-input" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: "auto", padding: "0.5rem 1rem" }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="card">
            <p style={{ textAlign: "center", color: "#64748b" }}>Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="card">
            <p style={{ textAlign: "center", color: "#64748b" }}>
              {filter === "all" ? "No complaints received yet" : `No ${filter} complaints`}
            </p>
          </div>
        ) : (
          <div className="complaints-grid">
            {filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="complaint-card"
                onClick={() => navigate(`/admin/complaint/${complaint._id}`)}
              >
                <div className="complaint-header">
                  <span className="complaint-category">{complaint.category}</span>
                  <span 
                    className="complaint-urgency" 
                    style={{ backgroundColor: getUrgencyColor(complaint.urgency) }}
                  >
                    {complaint.urgency}
                  </span>
                </div>
                <h3 className="complaint-subject">{complaint.subject}</h3>
                <p className="complaint-description">{complaint.description}</p>
                <div className="complaint-footer">
                  <span className="complaint-user">
                    👤 {complaint.userId?.name || "Unknown User"}
                  </span>
                  <span className="complaint-date">{formatDate(complaint.createdAt)}</span>
                </div>
                <div className="complaint-status">
                  Status: <span className="status-badge">{complaint.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Complaints;
