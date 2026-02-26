import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const name = localStorage.getItem("adminName");
  const navigate = useNavigate();
  const [residentCount, setResidentCount] = useState(0);
  const [securityCount, setSecurityCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Users",
      description: "Manage user profiles and resident details",
      icon: "👥",
      path: "/user-management",
      accent: "#2563eb"
    },
    {
      title: "Bookings",
      description: "Review facility bookings and approvals",
      icon: "📅",
      path: "/admin/booking-details",
      accent: "#0ea5e9"
    },
    {
      title: "Visitor Management",
      description: "Monitor visitor logs captured by security",
      icon: "🛡️",
      path: "/admin/visitor-monitoring",
      accent: "#14b8a6",
      tag: "View only"
    },
    {
      title: "Billing",
      description: "Track billing cycles and payments",
      icon: "💰",
      path: "/admin/billing",
      accent: "#f97316"
    },
    {
      title: "Grievances",
      description: "Resolve complaints and track status",
      icon: "⚠️",
      path: "/complaints",
      accent: "#ef4444"
    }
  ];

  const handleCardAction = (card) => {
    if (card.disabled) return;
    if (card.action) {
      card.action();
      return;
    }
    if (card.path) {
      navigate(card.path);
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const adminToken = localStorage.getItem("adminToken");
      const response = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log("Stats response:", response.data);
      setResidentCount(response.data.totalUsers || 0);
      setSecurityCount(response.data.totalSecurity || 0);
    } catch (err) {
      console.error("Error fetching stats:", err);
      console.error("Error details:", err.response?.data);
      setResidentCount(0);
      setSecurityCount(0);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard admin-dashboard--home">
        <header className="admin-hero">
          <div className="admin-hero__content">
            <p className="admin-hero__eyebrow">Admin Control Center</p>
            <h1 className="admin-hero__title">Welcome, {name}</h1>
            <p className="admin-hero__subtitle">
              Monitor community activity, respond quickly, and keep operations running smoothly.
            </p>
          </div>
          <div className="admin-hero__panel">
            <div className="admin-hero__panel-title">Community Overview</div>
            <div className="admin-hero__panel-row">
              <span>Total Residents</span>
              <strong>{statsLoading ? "..." : residentCount}</strong>
            </div>
            <div className="admin-hero__panel-row">
              <span>Security Staff</span>
              <strong>{statsLoading ? "..." : securityCount}</strong>
            </div>
            <div className="admin-hero__panel-row">
              <span>Status</span>
              <strong>{statsLoading ? "Updating..." : "Active"}</strong>
            </div>
          </div>
        </header>

        <section className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2 className="admin-section__title">Quick Modules</h2>
              <p className="admin-section__subtitle">Navigate core tools from a single view.</p>
            </div>
          </div>
          <div className="admin-card-grid">
            {dashboardCards.map((card) => (
              <button
                key={card.title}
                type="button"
                className={`admin-card${card.disabled ? " admin-card--disabled" : ""}`}
                style={{ "--card-accent": card.accent }}
                onClick={() => handleCardAction(card)}
                disabled={card.disabled}
                aria-disabled={card.disabled}
              >
                <div className="admin-card__top">
                  <span className="admin-card__icon" aria-hidden="true">{card.icon}</span>
                  {card.tag && <span className="admin-card__tag">{card.tag}</span>}
                </div>
                <h3 className="admin-card__title">{card.title}</h3>
                <p className="admin-card__description">{card.description}</p>
                <div className="admin-card__footer">
                  <span>{card.disabled ? "Locked" : "Open module"}</span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
            ))}
          </div>
        </section>


      </div>
    </>
  );
}

export default AdminDashboard;
