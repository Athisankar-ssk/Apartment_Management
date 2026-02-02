import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get(
        `http://localhost:5000/api/complaints/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComplaint(res.data.complaint);
      setStatus(res.data.complaint.status);
    } catch (err) {
      console.error("Error fetching complaint:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(
        `http://localhost:5000/api/complaints/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Status updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update status");
      console.error(err);
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="admin-dashboard">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (!complaint) {
    return (
      <>
        <Navbar />
        <div className="admin-dashboard">
          <p>Complaint not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Complaint Details</h1>
          <button className="btn outline" onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </button>
        </header>

        {message && (
          <div className="success-message">{message}</div>
        )}

        <div className="complaint-details-container">
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3>Complaint Information</h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span className="complaint-category">{complaint.category}</span>
                <span 
                  className="complaint-urgency" 
                  style={{ backgroundColor: getUrgencyColor(complaint.urgency) }}
                >
                  {complaint.urgency}
                </span>
              </div>
            </div>

            <div className="user-details">
              <div className="detail-row">
                <span className="detail-label">Subject:</span>
                <span className="detail-value" style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                  {complaint.subject}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{complaint.description}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Submitted On:</span>
                <span className="detail-value">{formatDate(complaint.createdAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Current Status:</span>
                <span className="detail-value">
                  <span className="status-badge">{complaint.status}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h3>User Details</h3>
            <div className="user-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{complaint.userId?.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{complaint.userId?.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{complaint.userId?.userId}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Apartment Number:</span>
                <span className="detail-value">{complaint.userId?.apartmentNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Mobile:</span>
                <span className="detail-value">{complaint.userId?.mobile}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Update Status</h3>
            <div className="form-group">
              <label className="label">Change Status</label>
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button 
                className="btn primary" 
                onClick={handleStatusUpdate}
                disabled={status === complaint.status}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ComplaintDetails;
