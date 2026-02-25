import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import "./AdminDashboard.css";

function VisitorManagement() {
  const navigate = useNavigate();
  const securityToken = localStorage.getItem("securityToken");
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [residents, setResidents] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchApartment, setSearchApartment] = useState("");
  
  const [formData, setFormData] = useState({
    visitorName: "",
    visitorPhone: "",
    residentId: "",
    apartmentNumber: "",
    inTime: "",
    outTime: ""
  });

  // Helper function to format local datetime
  const getLocalDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Update inTime when form opens
  useEffect(() => {
    if (showForm) {
      setFormData((prev) => ({
        ...prev,
        inTime: getLocalDateTime()
      }));
    }
  }, [showForm]);

  const [editingCheckout, setEditingCheckout] = useState(null);

  // Verify security token
  useEffect(() => {
    if (!securityToken) {
      navigate("/security-login");
    } else {
      fetchResidents();
      fetchVisitors();
      // Refresh visitors every 30 seconds
      const interval = setInterval(fetchVisitors, 30000);
      return () => clearInterval(interval);
    }
  }, [securityToken, navigate]);

  // Fetch residents
  const fetchResidents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/user/all", {
        headers: { Authorization: `Bearer ${securityToken}` }
      });
      setResidents(response.data);
    } catch (err) {
      console.error("Error fetching residents:", err);
    }
  };

  // Fetch visitors with filters
  const fetchVisitors = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:5000/api/visitors/all";
      const params = new URLSearchParams();
      
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (searchApartment) params.append("apartmentNumber", searchApartment);
      
      if (params.toString()) {
        url += "?" + params.toString();
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${securityToken}` }
      });
      setVisitors(response.data);
    } catch (err) {
      console.error("Error fetching visitors:", err);
    }
    setLoading(false);
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle resident selection
  const handleResidentChange = (e) => {
    const residentId = e.target.value;
    const resident = residents.find(r => r._id === residentId);
    setFormData((prev) => ({
      ...prev,
      residentId,
      apartmentNumber: resident ? resident.apartmentNumber : ""
    }));
  };

  // Add visitor entry
  const handleAddVisitor = async (e) => {
    e.preventDefault();
    
    if (!formData.visitorName || !formData.visitorPhone || !formData.residentId || !formData.apartmentNumber) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const submitData = {
        visitorName: formData.visitorName,
        visitorPhone: formData.visitorPhone,
        residentId: formData.residentId,
        apartmentNumber: formData.apartmentNumber,
        // Backend will capture current system time automatically
        outTime: formData.outTime ? new Date(formData.outTime).toISOString() : null
      };

      await axios.post("http://localhost:5000/api/visitors/add", submitData, {
        headers: { Authorization: `Bearer ${securityToken}` }
      });
      
      alert("Visitor entry added successfully");
      setFormData({
        visitorName: "",
        visitorPhone: "",
        residentId: "",
        apartmentNumber: "",
        inTime: new Date().toISOString().slice(0, 16),
        outTime: ""
      });
      setShowForm(false);
      fetchVisitors();
    } catch (err) {
      console.error("Error adding visitor:", err);
      alert("Error adding visitor entry");
    }
  };

  // Checkout visitor
  const handleCheckout = async (visitorId) => {
    if (!window.confirm("Confirm visitor checkout?")) return;

    try {
      await axios.put(`http://localhost:5000/api/visitors/${visitorId}/checkout`, {}, {
        headers: { Authorization: `Bearer ${securityToken}` }
      });
      
      alert("Visitor checkout recorded");
      setEditingCheckout(null);
      fetchVisitors();
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("Error recording checkout");
    }
  };

  // Format date and time
  const formatDateTime = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };

  // Calculate duration
  const calculateDuration = (inTime, outTime) => {
    if (!outTime) return "In Progress";
    const ms = new Date(outTime) - new Date(inTime);
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        {/* Header */}
        <header className="admin-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h1>Visitor Management</h1>
            <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
              Track and manage all visitor entries and exits
            </p>
          </div>
          <button
            onClick={() => navigate("/security/dashboard")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#4b5563"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#6b7280"}
          >
            ← Back to Dashboard
          </button>
        </header>

        {/* Statistics Section */}
        <section className="admin-grid" style={{ marginBottom: "2rem" }}>
          <div className="card" style={{ padding: "1.5rem", gridColumn: "1 / -1" }}>
            <h3 style={{ marginBottom: "1rem", color: "#1e293b" }}>Quick Stats</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#fef3c7", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "#d97706" }}>
                  {visitors.filter(v => v.status === 'inside').length}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.25rem" }}>Active Visitors</div>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#d1fae5", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "#059669" }}>
                  {visitors.length}
                </div>
                <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.25rem" }}>Total Entries</div>
              </div>
            </div>
          </div>
        </section>

        {/* Add Visitor Button & Filters */}
        <section style={{ marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "1rem",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
            onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
          >
            {showForm ? "Close Form" : "Add Visitor"}
          </button>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setSearchApartment("");
            }}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "1rem"
            }}
          >
            <option value="all">All Statuses</option>
            <option value="inside">Currently Inside</option>
            <option value="left">Has Left</option>
          </select>

          <input
            type="text"
            placeholder="Search by Apartment"
            value={searchApartment}
            onChange={(e) => setSearchApartment(e.target.value)}
            onBlur={() => filterStatus === "all" && fetchVisitors()}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "1rem"
            }}
          />
        </section>

        {/* Add Visitor Form */}
        {showForm && (
          <section style={{
            marginBottom: "2rem",
            padding: "2rem",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
          }}>
            <h2 style={{ marginBottom: "1.5rem", color: "#1e293b" }}>Add New Visitor Entry</h2>
            <form onSubmit={handleAddVisitor}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1e293b" }}>
                    Visitor Name *
                  </label>
                  <input
                    type="text"
                    name="visitorName"
                    value={formData.visitorName}
                    onChange={handleInputChange}
                    placeholder="Enter visitor name"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "1rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1e293b" }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="visitorPhone"
                    value={formData.visitorPhone}
                    onChange={handleInputChange}
                    placeholder="10-digit phone number"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "1rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1e293b" }}>
                    Resident to Visit *
                  </label>
                  <select
                    name="residentId"
                    value={formData.residentId}
                    onChange={handleResidentChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "1rem"
                    }}
                  >
                    <option value="">Select resident</option>
                    {residents.map((resident) => (
                      <option key={resident._id} value={resident._id}>
                        {resident.name} (Apt: {resident.apartmentNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1e293b" }}>
                    Apartment Number *
                  </label>
                  <input
                    type="text"
                    name="apartmentNumber"
                    value={formData.apartmentNumber}
                    readOnly
                    placeholder="Auto-filled"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "1rem",
                      backgroundColor: "#f1f5f9"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1e293b" }}>
                    In Time (System) *
                  </label>
                  <input
                    type="datetime-local"
                    name="inTime"
                    value={formData.inTime}
                    readOnly
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "1rem",
                      backgroundColor: "#f1f5f9"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#1e293b" }}>
                    Out Time
                  </label>
                  <input
                    type="datetime-local"
                    name="outTime"
                    value={formData.outTime}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "1rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}
                >
                  Add Visitor Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "1rem"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Visitors Table */}
        <section style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          overflow: "hidden"
        }}>
          <div style={{ padding: "1.5rem", borderBottom: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: 0, color: "#1e293b" }}>
              Visitor Entries {loading && "(Loading...)"}
            </h2>
          </div>

          {loading && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              Loading visitor data...
            </div>
          )}

          {!loading && visitors.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              No visitor entries found
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.95rem"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Visitor Name</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Phone</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Resident Name</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Apartment</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>In Time</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Out Time</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Duration</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Status</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors.map((visitor) => (
                    <tr key={visitor._id} style={{ borderBottom: "1px solid #e2e8f0", "&:hover": { backgroundColor: "#f8fafc" } }}>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.visitorName}</td>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.visitorPhone}</td>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.residentName}</td>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.apartmentNumber}</td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.9rem" }}>{formatDateTime(visitor.inTime)}</td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.9rem" }}>{formatDateTime(visitor.outTime)}</td>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{calculateDuration(visitor.inTime, visitor.outTime)}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.85rem",
                          fontWeight: "600",
                          backgroundColor: visitor.status === 'inside' ? '#fef3c7' : '#d1fae5',
                          color: visitor.status === 'inside' ? '#92400e' : '#065f46'
                        }}>
                          {visitor.status === 'inside' ? 'Inside' : 'Left'}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {visitor.status === 'inside' && (
                          <button
                            onClick={() => handleCheckout(visitor._id)}
                            style={{
                              padding: "0.5rem 1rem",
                              backgroundColor: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: "600",
                              fontSize: "0.85rem"
                            }}
                          >
                            Checkout
                          </button>
                        )}
                        {visitor.status === 'left' && (
                          <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Checked Out</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

export default VisitorManagement;
