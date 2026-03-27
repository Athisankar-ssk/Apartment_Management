import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function SecurityDashboard() {
  const name = localStorage.getItem("securityName");
  const securityId = localStorage.getItem("securityId");
  const securityToken = localStorage.getItem("securityToken");
  const navigate = useNavigate();

  const [stats, setStats] = useState({ activeVisitors: 0, todayEntries: 0, parkedVehicles: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

 
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [visitorRes, parkingRes] = await Promise.allSettled([
          axios.get("http://localhost:5000/api/visitors/all", {
            headers: { Authorization: `Bearer ${securityToken}` }
          }),
          axios.get("http://localhost:5000/api/parking/all", {
            headers: { Authorization: `Bearer ${securityToken}` }
          })
        ]);

        const visitors = visitorRes.status === "fulfilled" ? visitorRes.value.data : [];
        const parking  = parkingRes.status  === "fulfilled" ? parkingRes.value.data  : [];

        const today = new Date().toISOString().split("T")[0];
        const todayEntries   = visitors.filter(v => new Date(v.inTime).toISOString().split("T")[0] === today).length;
        const activeVisitors = visitors.filter(v => v.status === "inside").length;
        const parkedVehicles = parking.filter(p => p.status === "active" || p.status === "occupied").length;

        setStats({ activeVisitors, todayEntries, parkedVehicles });
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    if (securityToken) fetchStats();
  }, [securityToken]);

  const getShiftLabel = () => {
    const h = currentTime.getHours();
    if (h >= 6  && h < 14) return { label: "Morning Shift",  color: "#f59e0b" };
    if (h >= 14 && h < 22) return { label: "Evening Shift",  color: "#6366f1" };
    return                         { label: "Night Shift",   color: "#1e40af" };
  };
  const shift = getShiftLabel();

  const dashboardCards = [
    {
      title: "Visitor Management",
      description: "Log and monitor all visitor entries, cab arrivals, food deliveries, and service staff. Manage check-in and check-out.",
      icon: "👥",
      accent: "#2563eb",
      iconBg: "#eff6ff",
      badge: `${stats.activeVisitors} inside`,
      badgeColor: "#2563eb",
      badgeBg: "#dbeafe",
      path: "/security/visitor-management"
    },
    {
      title: "Parking Management",
      description: "Track vehicle entries, assigned parking slots, and view real-time parking occupancy across the premises.",
      icon: "🚗",
      accent: "#0d9488",
      iconBg: "#f0fdfa",
      badge: `${stats.parkedVehicles} parked`,
      badgeColor: "#0d9488",
      badgeBg: "#ccfbf1",
      path: "/security-parking-management"
    },
    {
      title: "Courier Notifications",
      description: "Log courier and parcel arrivals, notify residents to collect deliveries, and track pending pickups.",
      icon: "📦",
      accent: "#f59e0b",
      iconBg: "#fffbeb",
      badge: `${stats.activeVisitors >= 0 ? "Active" : ""} module`,
      badgeColor: "#b45309",
      badgeBg: "#fef3c7",
      path: "/security/courier-notifications"
    }
  ];

  return (
    <>
      <Navbar />
      <div className="admin-dashboard user-dashboard--home">

        {/* ── Hero ── */}
        <header className="admin-hero">
          <div className="admin-hero__content">
            <p className="admin-hero__eyebrow">
              <span style={{
                display: "inline-block",
                padding: "0.2rem 0.75rem",
                borderRadius: "20px",
                backgroundColor: shift.color,
                color: "white",
                fontWeight: "700",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontSize: "0.7rem",
                marginRight: "0.6rem",
                verticalAlign: "middle"
              }}>{shift.label}</span>
              🕐&nbsp;{currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              &nbsp;·&nbsp;
              {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
            <h1 className="admin-hero__title">Welcome, {name}</h1>
            <p className="admin-hero__subtitle">
              Security Officer &nbsp;·&nbsp; ID:&nbsp;<strong>{securityId}</strong>
              <br />
              Monitor premises activity, log visitors, and keep operations running smoothly.
            </p>
          </div>
          <div className="admin-hero__panel">
            <div className="admin-hero__panel-title">Live Overview</div>
            <div className="admin-hero__panel-row">
              <span>Active Visitors</span>
              <strong>{stats.activeVisitors}</strong>
            </div>
            <div className="admin-hero__panel-row">
              <span>Today's Entries</span>
              <strong>{stats.todayEntries}</strong>
            </div>
            <div className="admin-hero__panel-row">
              <span>Parked Vehicles</span>
              <strong>{stats.parkedVehicles}</strong>
            </div>
          </div>
        </header>

        {/* ── Modules ── */}
        <section className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2 className="admin-section__title">Security Modules</h2>
              <p className="admin-section__subtitle">Navigate core security tools from a single view.</p>
            </div>
          </div>
          <div className="admin-card-grid">
            {dashboardCards.map((card) => (
              <button
                key={card.title}
                type="button"
                className="admin-card"
                style={{ "--card-accent": card.accent }}
                onClick={() => navigate(card.path)}
              >
                <div className="admin-card__top">
                  <span className="admin-card__icon" aria-hidden="true">{card.icon}</span>
                  <span className="admin-card__tag">{card.badge}</span>
                </div>
                <h3 className="admin-card__title">{card.title}</h3>
                <p className="admin-card__description">{card.description}</p>
                <div className="admin-card__footer">
                  <span>Open module</span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ── Reminder strip ── */}
        <div style={{
          marginTop: "2rem",
          padding: "1.25rem 1.5rem",
          borderRadius: "12px",
          background: "linear-gradient(90deg, #f0f9ff, #e0f2fe)",
          border: "1px solid #bae6fd",
          display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap"
        }}>
          <span style={{ fontSize: "1.5rem" }}>ℹ️</span>
          <div>
            <p style={{ margin: 0, fontWeight: "700", color: "#0369a1", fontSize: "0.95rem" }}>Security Reminder</p>
            <p style={{ margin: 0, color: "#0284c7", fontSize: "0.875rem", marginTop: "0.2rem" }}>
              Always verify resident confirmation before allowing Cab, Food Delivery, or Service Staff entries. Maintain vigilance during shift handover.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

export default SecurityDashboard;
