import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const name = localStorage.getItem("adminName");
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
      </div>
    </>
  );
}

export default AdminDashboard;
