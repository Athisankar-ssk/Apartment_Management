import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function ComplaintStatus() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/user/login");
      return;
    }
    fetchMyComplaints();
  }, [navigate]);

  const fetchMyComplaints = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(
        "http://localhost:5000/api/complaints/my-complaints",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved": return "#22c55e";
      case "in-progress": return "#3b82f6";
      case "pending": return "#eab308";
      case "closed": return "#6b7280";
      default: return "#6b7280";
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
      day: "numeric"
    });
  };

  return (
    <>
      <UserNavbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>My Complaint Status</h1>
        </header>

        <section style={{ marginTop: "2rem" }}>
          {loading ? (
            <div className="card">
              <p style={{ textAlign: "center", color: "#64748b" }}>Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="card">
              <p style={{ textAlign: "center", color: "#64748b" }}>No complaints submitted yet</p>
            </div>
          ) : (
            <div className="complaints-grid">
              {complaints.map((complaint) => (
                <div key={complaint._id} className="user-complaint-card">
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
                    <span className="complaint-date">📅 {formatDate(complaint.createdAt)}</span>
                    <span 
                      className="user-status-badge" 
                      style={{ backgroundColor: getStatusColor(complaint.status) }}
                    >
                      {complaint.status === "in-progress" ? "In Progress" : complaint.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default ComplaintStatus;
