import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const name = localStorage.getItem("adminName");
  const [visitors, setVisitors] = useState([]);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [visitorsError, setVisitorsError] = useState("");
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  const dashboardCards = [
    {
      title: "Users",
      description: "Manage users and view user details",
      icon: "👥",
      path: "/user-management"
    },
    {
      title: "Bookings",
      description: "View and manage all bookings including parking, halls, and pools",
      icon: "📅",
      path: "/admin/booking-details"
    },
    {
      title: "Grievances",
      description: "Manage complaints and resolve grievances",
      icon: "⚠️",
      path: "/complaints"
    },
    {
      title: "Billing",
      description: "Manage billing and payment information",
      icon: "💰",
      path: "/admin/billing"
    }
  ];

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    const fetchVisitors = async () => {
      setVisitorsLoading(true);
      setVisitorsError("");
      try {
        const response = await axios.get("http://localhost:5000/api/visitors/admin/all", {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        setVisitors(response.data);
      } catch (err) {
        console.error("Error fetching visitor details:", err);
        setVisitorsError("Unable to load visitor details.");
      } finally {
        setVisitorsLoading(false);
      }
    };

    fetchVisitors();
  }, [navigate]);

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

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Welcome, {name}</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
            Manage your apartment community
          </p>
        </header>

        <section className="admin-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.path)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleCardClick(card.path);
              }}
              style={{
                padding: "2rem",
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
              }}
            >
              {/* Top color bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "4px",
                  backgroundColor: "#f0f3f8"
                }}
              />

              {/* Icon */}
              <div style={{ fontSize: "3rem" }}>{card.icon}</div>

              {/* Title */}
              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem", fontWeight: "700" }}>
                {card.title}
              </h3>

              {/* Description */}
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: "1.5" }}>
                {card.description}
              </p>

              {/* Arrow indicator */}
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "#3b82f6", fontWeight: "600", fontSize: "0.9rem" }}>Access</span>
                <span style={{ color: "#3b82f6", fontSize: "1.2rem" }}>→</span>
              </div>
            </div>
          ))}
        </section>

        <section style={{ marginTop: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
              flexWrap: "wrap",
              gap: "0.75rem"
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: "#1e293b" }}>Visitor Monitoring</h2>
              <p style={{ margin: "0.25rem 0 0", color: "#64748b" }}>
                View-only access to security logs
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: 0, color: "#1e293b" }}>Latest Visitor Entries</h3>
            </div>

            {visitorsLoading && (
              <div style={{ padding: "1.5rem", color: "#64748b" }}>Loading visitor data...</div>
            )}

            {!visitorsLoading && visitorsError && (
              <div style={{ padding: "1.5rem", color: "#b91c1c" }}>{visitorsError}</div>
            )}

            {!visitorsLoading && !visitorsError && visitors.length === 0 && (
              <div style={{ padding: "1.5rem", color: "#64748b" }}>No visitor entries found.</div>
            )}

            {!visitorsLoading && !visitorsError && visitors.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                      <th style={{ padding: "0.9rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Visitor Name</th>
                      <th style={{ padding: "0.9rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Phone</th>
                      <th style={{ padding: "0.9rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Resident Name</th>
                      <th style={{ padding: "0.9rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Apartment</th>
                      <th style={{ padding: "0.9rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>In Time</th>
                      <th style={{ padding: "0.9rem", textAlign: "left", fontWeight: "700", color: "#1e293b" }}>Out Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((visitor) => (
                      <tr key={visitor._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "0.9rem", color: "#1e293b" }}>{visitor.visitorName}</td>
                        <td style={{ padding: "0.9rem", color: "#1e293b" }}>{visitor.visitorPhone}</td>
                        <td style={{ padding: "0.9rem", color: "#1e293b" }}>{visitor.residentName}</td>
                        <td style={{ padding: "0.9rem", color: "#1e293b" }}>{visitor.apartmentNumber}</td>
                        <td style={{ padding: "0.9rem", color: "#1e293b", fontSize: "0.9rem" }}>
                          {formatDateTime(visitor.inTime)}
                        </td>
                        <td style={{ padding: "0.9rem", color: "#1e293b", fontSize: "0.9rem" }}>
                          {formatDateTime(visitor.outTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
