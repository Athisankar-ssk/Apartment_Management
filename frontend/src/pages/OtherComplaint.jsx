import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function OtherComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: "Other",
    subject: "",
    description: "",
    urgency: "medium"
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("userToken");
      await axios.post(
        "http://localhost:5000/api/complaints/submit",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Complaint registered successfully!");
      setIsError(false);
      setFormData({ category: "Other", subject: "", description: "", urgency: "medium" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to register complaint");
      setIsError(true);
    }
  };

  return (
    <>
      <UserNavbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Other Complaint</h1>
        </header>

        <div className="create-card card">
          <h3>Register Other Complaint</h3>
          
          {message && (
            <div className={isError ? "error-message" : "success-message"}>
              {message}
            </div>
          )}

          <form className="create-user-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="label">Subject</label>
                <input
                  type="text"
                  name="subject"
                  className="form-input"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Urgency Level</label>
                <select
                  name="urgency"
                  className="form-input"
                  value={formData.urgency}
                  onChange={handleChange}
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  className="form-input"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of the issue"
                  rows="5"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn outline" onClick={() => navigate('/user/dashboard')}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Submit Complaint
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default OtherComplaint;
