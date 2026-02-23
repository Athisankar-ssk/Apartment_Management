import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function SecurityParkingManagement() {
  const [parkingSlots, setParkingSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("securityToken");
    if (!token) {
      navigate("/security/login");
      return;
    }

    const fetchParkingData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/parking/security/all-allocations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setParkingSlots(response.data);
        setError("");
      } catch (err) {
        console.error("Error fetching parking data:", err);
        setError(
          err.response?.data?.message || "Failed to load parking data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchParkingData();
  }, [navigate]);

  const allocatedCount = parkingSlots.filter((slot) => slot.isAllocated).length;
  const availableCount = parkingSlots.length - allocatedCount;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="admin-dashboard">
          <p style={{ textAlign: "center", fontSize: "1.2rem" }}>
            Loading parking data...
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <button
              onClick={() => navigate("/security/dashboard")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#e2e8f0",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                color: "#334155",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#cbd5e1"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#e2e8f0"}
            >
              ← Back to Dashboard
            </button>
          </div>
          <h1>Parking Management</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
            Monitor all parking slot allocations
          </p>
        </header>

        {/* Stats Section */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#f0f9ff",
            borderRadius: "12px",
            border: "1px solid #bae6fd",
          }}>
            <p style={{ margin: "0 0 0.5rem 0", color: "#0369a1", fontSize: "0.9rem", fontWeight: "600" }}>
              Total Slots
            </p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: "700", color: "#0c4a6e" }}>
              {parkingSlots.length}
            </p>
          </div>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#fef3c7",
            borderRadius: "12px",
            border: "1px solid #fcd34d",
          }}>
            <p style={{ margin: "0 0 0.5rem 0", color: "#92400e", fontSize: "0.9rem", fontWeight: "600" }}>
              Allocated
            </p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: "700", color: "#78350f" }}>
              {allocatedCount}
            </p>
          </div>
          <div style={{
            padding: "1.5rem",
            backgroundColor: "#dcfce7",
            borderRadius: "12px",
            border: "1px solid #86efac",
          }}>
            <p style={{ margin: "0 0 0.5rem 0", color: "#166534", fontSize: "0.9rem", fontWeight: "600" }}>
              Available
            </p>
            <p style={{ margin: 0, fontSize: "2rem", fontWeight: "700", color: "#15803d" }}>
              {availableCount}
            </p>
          </div>
        </section>

        {error && (
          <div style={{
            padding: "1rem",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "2rem",
          }}>
            {error}
          </div>
        )}

        {/* Parking Slots Grid */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {parkingSlots.map((slot) => (
            <div
              key={slot.slotId}
              style={{
                padding: "1.5rem",
                backgroundColor: slot.isAllocated ? "#fef3c7" : "#f0fdf4",
                border: `2px solid ${slot.isAllocated ? "#fcd34d" : "#86efac"}`,
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Slot Header */}
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{
                  margin: "0 0 0.5rem 0",
                  color: "#1e293b",
                  fontSize: "1.25rem",
                  fontWeight: "700",
                }}>
                  {slot.slotName}
                </h3>
                <div style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  backgroundColor: slot.isAllocated ? "#fbbf24" : "#4ade80",
                  color: slot.isAllocated ? "#78350f" : "#15803d",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}>
                  {slot.isAllocated ? "Allocated" : "Available"}
                </div>
              </div>

              {/* Allocation Details */}
              {slot.isAllocated && slot.allocation ? (
                <div style={{ fontSize: "0.95rem" }}>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
                      User Name
                    </p>
                    <p style={{ margin: 0, color: "#1e293b", fontWeight: "600" }}>
                      {slot.allocation.userName}
                    </p>
                  </div>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
                      Apartment
                    </p>
                    <p style={{ margin: 0, color: "#1e293b", fontWeight: "600" }}>
                      {slot.allocation.apartmentNumber}
                    </p>
                  </div>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
                      Vehicle Number
                    </p>
                    <p style={{ margin: 0, color: "#1e293b", fontWeight: "600", fontSize: "1.05rem" }}>
                      {slot.allocation.vehicleNumber}
                    </p>
                  </div>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
                      Vehicle Type
                    </p>
                    <p style={{ margin: 0, color: "#1e293b", fontWeight: "600" }}>
                      {slot.allocation.vehicleType}
                    </p>
                  </div>

                  <div style={{ marginBottom: "0.75rem" }}>
                    <p style={{ margin: "0 0 0.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
                      Status
                    </p>
                    <p style={{
                      margin: 0,
                      color: "#1e293b",
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}>
                      {slot.allocation.status}
                    </p>
                  </div>

                  {slot.allocation.approvedDate && (
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", color: "#64748b", fontSize: "0.85rem" }}>
                        Approved Date
                      </p>
                      <p style={{ margin: 0, color: "#1e293b", fontWeight: "600", fontSize: "0.9rem" }}>
                        {new Date(slot.allocation.approvedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  padding: "1rem",
                  backgroundColor: "rgba(34, 197, 94, 0.1)",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#15803d",
                  fontSize: "0.95rem",
                }}>
                  This slot is currently available for booking
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export default SecurityParkingManagement;
