import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminVisitorMonitoring() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    fetchVisitors();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [visitors, searchTerm, searchField, filterDate]);

  const fetchVisitors = async () => {
    setLoading(true);
    setError("");
    try {
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get("http://localhost:5000/api/visitors/admin/all", {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      setVisitors(response.data);
    } catch (err) {
      console.error("Error fetching visitor details:", err);
      setError("Unable to load visitor records.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visitors];

    // Apply search filter based on selected field
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((visitor) => {
        if (searchField === "name") {
          return visitor.visitorName.toLowerCase().includes(term);
        } else if (searchField === "apartment") {
          return visitor.apartmentNumber.toLowerCase().includes(term);
        }
        return true;
      });
    }

    // Apply date filter
    if (filterDate) {
      filtered = filtered.filter((visitor) => {
        const visitorDate = new Date(visitor.inTime).toISOString().split("T")[0];
        return visitorDate === filterDate;
      });
    }

    setFilteredVisitors(filtered);
  };

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterDate("");
    setSearchField("name");
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <div>
            <h1>Visitor Monitoring</h1>
            <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
              View all visitor records in read-only mode
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
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

        {/* Search & Filter Section */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
            padding: "1.5rem",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0"
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>
              Search By
            </label>
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "1rem"
              }}
            >
              <option value="name">Visitor Name</option>
              <option value="apartment">Apartment Number</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>
              Search Term
            </label>
            <input
              type="text"
              placeholder={`Enter ${searchField === "name" ? "visitor name" : "apartment number"}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
            <button
              onClick={handleClearFilters}
              style={{
                padding: "0.75rem 1.2rem",
                backgroundColor: "#e5e7eb",
                color: "#1e293b",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#d1d5db"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#e5e7eb"}
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* Visitor Records Table */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}
        >
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
            <h3 style={{ margin: 0, color: "#1e293b" }}>
              Visitor Records {loading && "(Loading...)"} ({filteredVisitors.length} results)
            </h3>
          </div>

          {loading && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              Loading visitor records...
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>{error}</div>
          )}

          {!loading && !error && filteredVisitors.length === 0 && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              No visitor records found matching your criteria.
            </div>
          )}

          {!loading && !error && filteredVisitors.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem"
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#1e293b"
                      }}
                    >
                      Visitor Name
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#1e293b"
                      }}
                    >
                      Phone Number
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#1e293b"
                      }}
                    >
                      Resident Name
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#1e293b"
                      }}
                    >
                      Apartment Number
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#1e293b"
                      }}
                    >
                      In Time
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "700",
                        color: "#1e293b"
                      }}
                    >
                      Out Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.visitorName}</td>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.visitorPhone}</td>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.residentName}</td>
                      <td style={{ padding: "1rem", color: "#1e293b" }}>{visitor.apartmentNumber}</td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.9rem" }}>
                        {formatDateTime(visitor.inTime)}
                      </td>
                      <td style={{ padding: "1rem", color: "#1e293b", fontSize: "0.9rem" }}>
                        {formatDateTime(visitor.outTime)}
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

export default AdminVisitorMonitoring;
