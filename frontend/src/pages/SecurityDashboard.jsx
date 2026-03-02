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
      accent: "#3b82f6",
      bg: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      badge: `${stats.activeVisitors} inside`,
      badgeColor: "#3b82f6",
      path: "/security/visitor-management"
    },
    {
      title: "Parking Management",
      description: "Track vehicle entries, assigned parking slots, and view real-time parking occupancy across the premises.",
      icon: "🚗",
      accent: "#10b981",
      bg: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
      badge: `${stats.parkedVehicles} parked`,
      badgeColor: "#10b981",
      path: "/security-parking-management"
    },
    {
      title: "Incident Reports",
      description: "Document security incidents, raise alerts, and maintain a log of all on-premises events for admin review.",
      icon: "🚨",
      accent: "#ef4444",
      bg: "linear-gradient(135deg, #fff1f1 0%, #fee2e2 100%)",
      badge: "Coming soon",
      badgeColor: "#ef4444",
      path: "#"
    }
  ];

  return (
    <>
      <Navbar />

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "3rem 2rem 3.5rem"
      }}>
        {/* decorative rings */}
        {[300, 500, 700].map((size, i) => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", right: "-60px",
            width: `${size}px`, height: `${size}px`,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.07)",
            transform: "translateY(-50%)",
            pointerEvents: "none"
          }} />
        ))}
        {/* grid pattern overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
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
              textTransform: "uppercase"
            }}>{shift.label}</span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
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
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem",
              boxShadow: "0 0 0 4px rgba(99,102,241,0.3)"
            }}>🛡️</div>
            <div>
              <h1 style={{ margin: 0, color: "white", fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
                Welcome back, {name}
              </h1>
              <p style={{ margin: "0.35rem 0 0", color: "rgba(255,255,255,0.55)", fontSize: "0.95rem" }}>
                Security Officer &nbsp;·&nbsp; ID: <strong style={{ color: "rgba(255,255,255,0.8)" }}>{securityId}</strong>
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
                backgroundColor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", marginTop: "0.25rem", whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="admin-dashboard" style={{ paddingTop: "2rem" }}>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ width: "4px", height: "24px", borderRadius: "2px", background: "linear-gradient(#3b82f6,#6366f1)" }} />
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.2rem", fontWeight: "700" }}>Security Modules</h2>
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
                background: card.bg,
                border: `1px solid ${card.accent}22`,
                borderRadius: "16px",
                padding: "1.75rem",
                cursor: "pointer",
                transition: "all 0.25s ease",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = `0 16px 32px ${card.accent}28`;
                e.currentTarget.style.borderColor = `${card.accent}55`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = `${card.accent}22`;
              }}
            >
              {/* accent top bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: `linear-gradient(90deg, ${card.accent}, ${card.accent}88)`, borderRadius: "16px 16px 0 0" }} />

              {/* icon + badge row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{
                  width: "56px", height: "56px",
                  borderRadius: "14px",
                  backgroundColor: `${card.accent}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem"
                }}>{card.icon}</div>
                <span style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  backgroundColor: `${card.badgeColor}18`,
                  color: card.badgeColor,
                  border: `1px solid ${card.badgeColor}33`,
                  whiteSpace: "nowrap"
                }}>{card.badge}</span>
              </div>

              <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.2rem", fontWeight: "700" }}>{card.title}</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem", lineHeight: "1.6", flexGrow: 1 }}>{card.description}</p>

              <div style={{
                marginTop: "0.5rem",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                paddingTop: "1rem",
                borderTop: `1px solid ${card.accent}20`
              }}>
                <span style={{ color: card.accent, fontWeight: "700", fontSize: "0.9rem" }}>Open Module</span>
                <div style={{
                  width: "32px", height: "32px",
                  borderRadius: "50%",
                  backgroundColor: `${card.accent}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: card.accent,
                  fontSize: "1.1rem",
                  fontWeight: "700"
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
