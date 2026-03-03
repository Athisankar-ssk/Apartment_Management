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

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live stats
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

      {/* ── Hero Banner ── */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        padding: "3rem 2rem 3.5rem",
        backgroundImage: "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&auto=format&fit=crop&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        backgroundRepeat: "no-repeat"
      }}>
        {/* light overlay so photo shows brightly but text stays readable */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(120deg, rgba(240,249,255,0.82) 0%, rgba(224,242,254,0.78) 50%, rgba(219,234,254,0.80) 100%)",
          pointerEvents: "none"
        }} />
        {/* soft bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
          background: "linear-gradient(to bottom, transparent, rgba(224,242,254,0.55))",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto" }}>
          {/* shift + time row */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <span style={{
              padding: "0.3rem 0.9rem",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "700",
              backgroundColor: shift.color,
              color: "white",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              boxShadow: `0 2px 8px ${shift.color}55`
            }}>{shift.label}</span>
            <span style={{ color: "#475569", fontSize: "0.9rem", fontWeight: "500" }}>
              🕐 {currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              &nbsp;·&nbsp;
              {currentTime.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          {/* welcome */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
            <div style={{
              width: "64px", height: "64px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem",
              boxShadow: "0 0 0 4px rgba(59,130,246,0.25), 0 4px 16px rgba(59,130,246,0.3)"
            }}>🛡️</div>
            <div>
              <h1 style={{ margin: 0, color: "#0f172a", fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.02em", textShadow: "0 1px 2px rgba(255,255,255,0.6)" }}>
                Welcome back, {name}
              </h1>
              <p style={{ margin: "0.35rem 0 0", color: "#334155", fontSize: "0.95rem" }}>
                Security Officer &nbsp;·&nbsp; ID: <strong style={{ color: "#1e40af" }}>{securityId}</strong>
              </p>
            </div>
          </div>

          {/* live stat pills */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}>
            {[
              { label: "Active Visitors", value: stats.activeVisitors, color: "#3b82f6" },
              { label: "Today's Entries",  value: stats.todayEntries,   color: "#10b981" },
              { label: "Parked Vehicles",  value: stats.parkedVehicles, color: "#f59e0b" }
            ].map((s, i) => (
              <div key={i} style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "12px",
                backgroundColor: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.9)",
                display: "flex", flexDirection: "column", alignItems: "center",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
              }}>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem", whiteSpace: "nowrap", fontWeight: "600" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="admin-dashboard" style={{ paddingTop: "2rem" }}>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: "linear-gradient(#0ea5e9,#3b82f6)" }} />
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.2rem", fontWeight: "700" }}>Security Modules</h2>
        </div>

        {/* Cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              onClick={() => navigate(card.path)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => { if (e.key === "Enter") navigate(card.path); }}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e8f0",
                borderLeft: `4px solid ${card.accent}`,
                borderRadius: "12px",
                padding: "1.75rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.07)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
                e.currentTarget.style.borderColor = card.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.borderLeftColor = card.accent;
              }}
            >
              {/* accent top bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "0px" }} />

              {/* icon + badge row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{
                  width: "52px", height: "52px",
                  borderRadius: "10px",
                  backgroundColor: card.iconBg,
                  border: `1px solid ${card.accent}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.6rem"
                }}>{card.icon}</div>
                <span style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  backgroundColor: card.badgeBg,
                  color: card.badgeColor,
                  whiteSpace: "nowrap"
                }}>{card.badge}</span>
              </div>

              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.2rem", fontWeight: "700" }}>{card.title}</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem", lineHeight: "1.6", flexGrow: 1 }}>{card.description}</p>

              <div style={{
                marginTop: "0.5rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: "1rem",
                borderTop: "1px solid #f1f5f9"
              }}>
                <span style={{ color: card.accent, fontWeight: "600", fontSize: "0.9rem" }}>Open Module</span>
                <div style={{
                  width: "30px", height: "30px",
                  borderRadius: "50%",
                  backgroundColor: card.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: card.accent,
                  fontSize: "1rem",
                  fontWeight: "700",
                  border: `1px solid ${card.accent}30`
                }}>→</div>
              </div>
            </div>
          ))}
        </section>

        {/* Info strip */}
        <div style={{
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
