import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

const typeConfig = {
  "Package":  { icon: "📦", color: "#2563eb", bg: "#eff6ff" },
  "Letter":   { icon: "✉️", color: "#7c3aed", bg: "#f5f3ff" },
  "Document": { icon: "📄", color: "#0d9488", bg: "#f0fdfa" },
};

function LetterCourier() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); 
  const [marking, setMarking] = useState(null);
  const [markError, setMarkError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) { navigate("/user/login"); return; }
    fetchNotifications(token);
  }, [navigate]);

  const fetchNotifications = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/courier/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching courier notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = notifications.filter(n => filter === "all" || n.status === filter);
  const pendingCount = notifications.filter(n => n.status === "pending").length;

  const markReceived = async (id) => {
    const token = localStorage.getItem("userToken");
    setMarking(id);
    setMarkError("");
    try {
      await axios.patch(`http://localhost:5000/api/courier/${id}/received`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n._id === id
          ? { ...n, status: "collected", collectedAt: new Date().toISOString() }
          : n
        )
      );
    } catch (err) {
      console.error("Error marking as received:", err);
      setMarkError(err.response?.data?.message || "Failed to mark as received. Please try again.");
    } finally {
      setMarking(null);
    }
  };

  return (
    <>
      <UserNavbar />
      <div className="admin-dashboard">
        {/* Header */}
        <header className="admin-header">
          <div>
            <h1>Letter &amp; Courier Notifications</h1>
            <p style={{ color: "#64748b", marginTop: "0.3rem", fontSize: "0.95rem" }}>
              Parcels and letters logged by security for your apartment
            </p>
          </div>
          {pendingCount > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1rem", borderRadius: "8px",
              background: "#fef3c7", border: "1px solid #fbbf24",
              color: "#92400e", fontWeight: "700", fontSize: "0.9rem"
            }}>
              <span>🔔</span>
              {pendingCount} pending {pendingCount === 1 ? "item" : "items"} to collect
            </div>
          )}
        </header>

        {/* Filter pills */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {[
            { key: "all",       label: "All" },
            { key: "pending",   label: "⏳ Pending" },
            { key: "collected", label: "✅ Collected" },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: "5px 16px", borderRadius: "16px", cursor: "pointer",
              fontSize: "0.85rem", fontWeight: filter === f.key ? "700" : "500",
              border: `1.5px solid ${filter === f.key ? "#2563eb" : "#e2e8f0"}`,
              background: filter === f.key ? "#eff6ff" : "#fff",
              color: filter === f.key ? "#2563eb" : "#64748b",
              transition: "all 0.15s",
            }}>{f.label}</button>
          ))}
          <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "0.82rem" }}>
            {filtered.length} record{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Content */}
        {markError && (
          <div style={{
            marginBottom: "1rem", padding: "0.75rem 1rem", borderRadius: "8px",
            background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b",
            fontSize: "0.875rem", fontWeight: "600",
          }}>
            ⚠️ {markError}
          </div>
        )}
        {loading ? (
          <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "#64748b" }}>
            Loading your notifications…
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
            <p style={{ margin: 0, fontWeight: "600", color: "#475569", fontSize: "1rem" }}>
              {filter === "all" ? "No courier notifications yet" : `No ${filter} items`}
            </p>
            <p style={{ margin: "0.4rem 0 0", color: "#94a3b8", fontSize: "0.875rem" }}>
              Security will log a notification when a parcel or letter arrives for you.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {filtered.map(n => {
              const cfg = typeConfig[n.courierType] || { icon: "📬", color: "#64748b", bg: "#f8fafc" };
              return (
                <div key={n._id} className="card" style={{
                  padding: "1.25rem",
                  borderLeft: `4px solid ${cfg.color}`,
                  position: "relative",
                }}>
                  {/* Status badge */}
                  <span style={{
                    position: "absolute", top: "1rem", right: "1rem",
                    padding: "3px 10px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: "700",
                    background: n.status === "pending" ? "#fef3c7" : "#d1fae5",
                    color:      n.status === "pending" ? "#92400e" : "#065f46",
                  }}>
                    {n.status === "pending" ? "⏳ Awaiting Collection" : "✅ Collected"}
                  </span>

                  {/* Icon + type */}
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "10px",
                    background: cfg.bg, border: `1px solid ${cfg.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem", marginBottom: "0.75rem"
                  }}>{cfg.icon}</div>

                  <p style={{ margin: 0, fontWeight: "700", color: "#1e293b", fontSize: "1rem" }}>
                    {n.courierType}
                    {n.courierFrom && <span style={{ fontWeight: "500", color: "#64748b" }}> · {n.courierFrom}</span>}
                  </p>

                  {n.description && (
                    <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.82rem", fontStyle: "italic" }}>
                      "{n.description}"
                    </p>
                  )}

                  <div style={{
                    marginTop: "0.9rem", paddingTop: "0.75rem",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex", flexDirection: "column", gap: "3px"
                  }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      🛡️ Logged by <strong>{n.notifiedBy}</strong> (Security ID: {n.securityId})
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      🕐 {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                    {n.status === "collected" && n.collectedAt && (
                      <span style={{ fontSize: "0.8rem", color: "#10b981" }}>
                        ✅ Collected on {new Date(n.collectedAt).toLocaleString("en-IN", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    )}
                  </div>

                  {n.status === "pending" && (
                    <button
                      onClick={() => markReceived(n._id)}
                      disabled={marking === n._id}
                      style={{
                        marginTop: "0.85rem", width: "100%",
                        padding: "8px 0", borderRadius: "8px", cursor: marking === n._id ? "not-allowed" : "pointer",
                        border: "none", fontWeight: "700", fontSize: "0.88rem",
                        background: marking === n._id
                          ? "#6ee7b7"
                          : "linear-gradient(135deg, #059669, #10b981)",
                        color: "#fff", letterSpacing: "0.02em",
                        boxShadow: "0 2px 8px rgba(16,185,129,0.25)",
                        transition: "opacity 0.15s",
                        opacity: marking === n._id ? 0.75 : 1,
                      }}
                    >
                      {marking === n._id ? "⏳ Marking…" : "✅ Mark as Received"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default LetterCourier;

