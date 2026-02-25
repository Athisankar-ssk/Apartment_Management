import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function SecurityDashboard() {
  const name = localStorage.getItem("securityName");
  const securityId = localStorage.getItem("securityId");
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  const dashboardCards = [
    {
      title: "Visitor Management",
      description: "Track and manage visitor entries and exits",
      icon: "👤",
      path: "/security/visitor-management"
    },
    {
      title: "Incident Reports",
      description: "Report and view security incidents",
      icon: "📋",
      path: "#"
    },
    {
      title: "Parking Management",
      description: "Monitor vehicle entries and parking slots",
      icon: "🚗",
      path: "/security-parking-management"
    },
   
  ];

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Welcome, {name}</h1>
          <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
            Security ID: {securityId}
          </p>
          <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.95rem" }}>
            Manage security operations and monitor apartment safety
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

        <section className="admin-grid" style={{ marginTop: "2rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "#1e293b" }}>Quick Stats</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6" }}>0</div>
                <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.25rem" }}>Active Visitors</div>
              </div>
              <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>0</div>
                <div style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.25rem" }}>Today's Entries</div>
              </div>
              
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default SecurityDashboard;
