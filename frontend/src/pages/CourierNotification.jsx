import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

const COURIER_TYPES = ["Package", "Letter", "Document"];

const typeConfig = {
  "Package":  { icon: "📦", color: "#2563eb", bg: "#eff6ff" },
  "Letter":   { icon: "✉️", color: "#7c3aed", bg: "#f5f3ff" },
  "Document": { icon: "📄", color: "#0d9488", bg: "#f0fdfa" },
};

const emptyForm = {
  residentName: "",
  apartmentNumber: "",
  courierType: "Package",
  courierFrom: "",
  description: "",
};

function CourierNotification() {
  const navigate = useNavigate();
  const securityToken = localStorage.getItem("securityToken");

  const [form, setForm] = useState(emptyForm);
  const [residents, setResidents] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState("log"); // "log" | "history"
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "collected"

  useEffect(() => {
    if (!securityToken) { navigate("/security/login"); return; }
    fetchResidents();
    fetchNotifications();
  }, []);

  // Auto-refresh history every 30 s so resident collections reflect without manual reload
  useEffect(() => {
    if (activeTab !== "history") return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchResidents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/user/all", {
        headers: { Authorization: `Bearer ${securityToken}` },
      });
      setResidents(res.data);
    } catch (err) {
      console.error("Error fetching residents:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/courier", {
        headers: { Authorization: `Bearer ${securityToken}` },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // When apartment is selected from dropdown, auto-fill resident name
  const handleApartmentChange = (e) => {
    const apartmentNumber = e.target.value;
    const resident = residents.find(r => r.apartmentNumber === apartmentNumber);
    setForm(prev => ({
      ...prev,
      apartmentNumber,
      residentName: resident ? resident.name : "",
    }));
  };

  // Sorted unique apartment numbers
  const sortedApartments = [...new Set(residents.map(r => r.apartmentNumber))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      await axios.post("http://localhost:5000/api/courier", form, {
        headers: { Authorization: `Bearer ${securityToken}` },
      });
      setMessage({ type: "success", text: `Courier notification logged for Apt ${form.apartmentNumber} — ${form.residentName}` });
      setForm(emptyForm);
      fetchNotifications();
      setTimeout(() => setActiveTab("history"), 800);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to log notification" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkCollected = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/courier/${id}/collected`, {}, {
        headers: { Authorization: `Bearer ${securityToken}` },
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => filter === "all" || n.status === filter);
  const pendingCount = notifications.filter((n) => n.status === "pending").length;

  return (
    <>
      <Navbar />

      {/* Hero banner */}
      <div style={{
        position: "relative", overflow: "hidden",
        padding: "2.5rem 2rem 3rem",
        backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80')",
        backgroundSize: "cover", backgroundPosition: "center 55%",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(120deg, rgba(15,23,42,0.84) 0%, rgba(30,58,138,0.78) 55%, rgba(15,23,42,0.80) 100%)",
        }} />
        <div style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <div style={{
            width: "60px", height: "60px", borderRadius: "50%",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.8rem",
            boxShadow: "0 0 0 4px rgba(245,158,11,0.25), 0 4px 16px rgba(245,158,11,0.3)"
          }}>📦</div>
          <div>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.65)", fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Security Module
            </p>
            <h1 style={{ margin: "0.2rem 0 0", color: "#ffffff", fontSize: "1.9rem", fontWeight: "800", letterSpacing: "-0.02em" }}>
              Courier Notifications
            </h1>
            <p style={{ margin: "0.3rem 0 0", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
              Log courier arrivals and notify residents to collect their parcels
            </p>
          </div>
          {pendingCount > 0 && (
            <div style={{
              marginLeft: "auto",
              padding: "0.6rem 1.2rem",
              borderRadius: "10px",
              background: "rgba(245,158,11,0.2)",
              border: "1px solid rgba(245,158,11,0.4)",
              color: "#fbbf24",
              fontWeight: "700",
              fontSize: "0.95rem",
              display: "flex", alignItems: "center", gap: "0.5rem"
            }}>
              <span style={{ fontSize: "1.3rem" }}>🔔</span>
              {pendingCount} pending {pendingCount === 1 ? "collection" : "collections"}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="admin-dashboard" style={{ paddingTop: "1.5rem" }}>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: "0", marginBottom: "1.5rem", background: "rgba(255,255,255,0.7)", borderRadius: "10px", padding: "4px", border: "1px solid rgba(199,210,254,0.4)", width: "fit-content" }}>
          {[{ key: "log", label: "📝 Log Courier" }, { key: "history", label: `📋 History${pendingCount > 0 ? ` (${pendingCount} pending)` : ""}` }].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "7px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s",
                background: activeTab === t.key ? "#2563eb" : "transparent",
                color: activeTab === t.key ? "#fff" : "#64748b",
                boxShadow: activeTab === t.key ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── LOG TAB ── */}
        {activeTab === "log" && (
          <div className="card" style={{ maxWidth: "720px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>📦</div>
              <div>
                <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.05rem", fontWeight: "700" }}>Log Courier Arrival</h3>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.82rem" }}>Fill in the details so the resident is notified to collect</p>
              </div>
            </div>

            {message.text && (
              <div style={{
                padding: "0.7rem 1rem",
                borderRadius: "8px",
                marginBottom: "1.25rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                background: message.type === "success" ? "#d1fae5" : "#fee2e2",
                color:      message.type === "success" ? "#065f46" : "#991b1b",
                borderLeft: `4px solid ${message.type === "success" ? "#10b981" : "#ef4444"}`,
              }}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>

                {/* Apartment dropdown */}
                <div className="form-group">
                  <label className="label">Apartment Number *</label>
                  <select
                    name="apartmentNumber"
                    className="form-input"
                    value={form.apartmentNumber}
                    onChange={handleApartmentChange}
                    required
                    style={{
                      cursor: "pointer",
                      background: form.apartmentNumber ? "#eff6ff" : "#fff",
                      color: form.apartmentNumber ? "#1d4ed8" : "#374151",
                      fontWeight: form.apartmentNumber ? "600" : "400",
                      border: `1.5px solid ${form.apartmentNumber ? "#3b82f6" : "#e2e8f0"}`,
                    }}
                  >
                    <option value="">— Select Apartment —</option>
                    {sortedApartments.map(apt => (
                      <option key={apt} value={apt}>{apt}</option>
                    ))}
                  </select>
                </div>

                {/* Resident name — auto-filled from apartment */}
                <div className="form-group">
                  <label className="label">
                    Resident Name *
                    {form.residentName && (
                      <span style={{ marginLeft: "0.5rem", fontSize: "0.72rem", fontWeight: "600", color: "#059669", background: "#d1fae5", padding: "1px 7px", borderRadius: "10px" }}>
                        ✓ Auto-filled
                      </span>
                    )}
                  </label>
                  <input
                    name="residentName"
                    className="form-input"
                    value={form.residentName}
                    onChange={handleChange}
                    placeholder="Auto-filled on apartment select"
                    required
                    style={{
                      background: form.residentName ? "#f0fdf4" : "#fff",
                      color: form.residentName ? "#065f46" : "#374151",
                      fontWeight: form.residentName ? "600" : "400",
                      border: `1.5px solid ${form.residentName ? "#10b981" : "#e2e8f0"}`,
                    }}
                  />
                </div>

                {/* Courier type as pill selector */}
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label className="label">Courier Type *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "4px" }}>
                    {COURIER_TYPES.map((type) => {
                      const cfg = typeConfig[type];
                      const active = form.courierType === type;
                      return (
                        <button
                          key={type} type="button"
                          onClick={() => setForm({ ...form, courierType: type })}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: active ? "700" : "500",
                            cursor: "pointer",
                            transition: "all 0.18s",
                            border: `1.5px solid ${active ? cfg.color : "#e2e8f0"}`,
                            background: active ? cfg.bg : "#fff",
                            color: active ? cfg.color : "#64748b",
                            boxShadow: active ? `0 0 0 3px ${cfg.color}20` : "none",
                          }}
                        >{cfg.icon} {type}</button>
                      );
                    })}
                  </div>
                </div>

                {/* Courier from */}
                <div className="form-group">
                  <label className="label">Courier From / Company</label>
                  <input name="courierFrom" className="form-input" value={form.courierFrom}
                    onChange={handleChange} placeholder="e.g. Amazon, FedEx, BlueDart" />
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="label">Additional Notes</label>
                  <input name="description" className="form-input" value={form.description}
                    onChange={handleChange} placeholder="e.g. Fragile, keep at desk" />
                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button type="button" className="btn outline" onClick={() => navigate("/security/dashboard")}>
                    Cancel
                  </button>
                  <button type="submit" className="btn primary" disabled={submitting}
                    style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Logging…" : "📦 Log Courier Arrival"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div>
            {/* Filter pills + refresh */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: "600" }}>Filter:</span>
              {[{ key: "all", label: "All" }, { key: "pending", label: "⏳ Pending" }, { key: "collected", label: "✅ Collected" }].map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  style={{
                    padding: "5px 14px", borderRadius: "16px", border: "1.5px solid",
                    borderColor: filter === f.key ? "#2563eb" : "#e2e8f0",
                    background: filter === f.key ? "#eff6ff" : "#fff",
                    color: filter === f.key ? "#2563eb" : "#64748b",
                    fontWeight: filter === f.key ? "700" : "500",
                    fontSize: "0.82rem", cursor: "pointer",
                  }}>{f.label}</button>
              ))}
              <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "0.82rem" }}>
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={fetchNotifications}
                disabled={loading}
                style={{
                  padding: "5px 13px", borderRadius: "16px", border: "1.5px solid #e2e8f0",
                  background: "#fff", color: "#2563eb", fontWeight: "600",
                  fontSize: "0.82rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                  opacity: loading ? 0.6 : 1,
                }}
              >🔄 Refresh</button>
            </div>

            {loading ? (
              <p style={{ color: "#64748b", textAlign: "center", padding: "2rem" }}>Loading…</p>
            ) : filtered.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "2.5rem", color: "#94a3b8" }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
                <p style={{ margin: 0, fontSize: "1rem", fontWeight: "600" }}>No records found</p>
                <p style={{ margin: "0.4rem 0 0", fontSize: "0.85rem" }}>Log a courier arrival to see it here.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
                {filtered.map((n) => {
                  const cfg = typeConfig[n.courierType] || typeConfig["Other"];
                  return (
                    <div key={n._id} className="card" style={{ padding: "1.25rem", borderLeft: `4px solid ${cfg.color}` }}>
                      {/* Type icon + status */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div style={{
                          width: "42px", height: "42px", borderRadius: "9px",
                          background: cfg.bg, border: `1px solid ${cfg.color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem"
                        }}>{cfg.icon}</div>
                        <span style={{
                          padding: "3px 10px", borderRadius: "5px", fontSize: "0.75rem", fontWeight: "700",
                          background: n.status === "pending" ? "#fef3c7" : "#d1fae5",
                          color:      n.status === "pending" ? "#92400e" : "#065f46",
                        }}>{n.status === "pending" ? "⏳ Pending" : "✅ Collected"}</span>
                      </div>

                      <p style={{ margin: 0, fontWeight: "700", color: "#1e293b", fontSize: "1rem" }}>{n.residentName}</p>
                      <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                        🏠 Apt {n.apartmentNumber} &nbsp;·&nbsp; {n.courierType}
                        {n.courierFrom && <> &nbsp;·&nbsp; {n.courierFrom}</>}
                      </p>
                      {n.description && (
                        <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: "0.82rem", fontStyle: "italic" }}>
                          "{n.description}"
                        </p>
                      )}

                      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                          Logged by {n.notifiedBy} · {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {n.status === "collected" && n.collectedAt && (
                          <span style={{ fontSize: "0.78rem", color: "#10b981" }}>
                            Collected {new Date(n.collectedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default CourierNotification;
