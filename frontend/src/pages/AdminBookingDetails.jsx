import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminBookingDetails() {
  const navigate = useNavigate();
  const [playgroundBookings, setPlaygroundBookings] = useState([]);
  const [partyHallBookings, setPartyHallBookings] = useState([]);
  const [filteredPlaygroundBookings, setFilteredPlaygroundBookings] = useState([]);
  const [filteredPartyHallBookings, setFilteredPartyHallBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("playground");

  useEffect(() => {
    // Check if admin is logged in
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    
    fetchAllBookings();
  }, [navigate]);

  useEffect(() => {
    applyFilters();
  }, [playgroundBookings, partyHallBookings, filterDate, filterStatus]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      // Fetch playground bookings
      const playgroundRes = await axios.get(
        "http://localhost:5000/api/playground/admin/all-bookings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlaygroundBookings(playgroundRes.data);

      // Fetch party hall bookings
      const partyHallRes = await axios.get(
        "http://localhost:5000/api/partyhall/admin/all-bookings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPartyHallBookings(partyHallRes.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminName");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Filter playground bookings
    let filteredPlayground = [...playgroundBookings];
    if (filterDate) {
      filteredPlayground = filteredPlayground.filter((booking) => booking.date === filterDate);
    }
    if (filterStatus !== "all") {
      filteredPlayground = filteredPlayground.filter((booking) => booking.status === filterStatus);
    }
    setFilteredPlaygroundBookings(filteredPlayground);

    // Filter party hall bookings
    let filteredPartyHall = [...partyHallBookings];
    if (filterDate) {
      filteredPartyHall = filteredPartyHall.filter((booking) => booking.date === filterDate);
    }
    if (filterStatus !== "all") {
      filteredPartyHall = filteredPartyHall.filter((booking) => booking.status === filterStatus);
    }
    setFilteredPartyHallBookings(filteredPartyHall);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: { bg: "#d4edda", color: "#155724" },
      cancelled: { bg: "#f8d7da", color: "#721c24" },
    };
    const style = colors[status] || colors.confirmed;

    return (
      <span
        style={{
          padding: "0.25rem 0.75rem",
          backgroundColor: style.bg,
          color: style.color,
          borderRadius: "4px",
          fontSize: "0.875rem",
          fontWeight: "500",
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Booking Details.</h1>
        </header>

        {/* Tab Navigation */}
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", borderBottom: "2px solid #e2e8f0" }}>
          <button
            onClick={() => setActiveTab("playground")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === "playground" ? "3px solid #3b82f6" : "3px solid transparent",
              color: activeTab === "playground" ? "#3b82f6" : "#64748b",
              fontWeight: activeTab === "playground" ? "600" : "500",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "all 0.2s",
            }}
          >
            Playground Bookings
          </button>
          <button
            onClick={() => setActiveTab("partyhall")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === "partyhall" ? "3px solid #3b82f6" : "3px solid transparent",
              color: activeTab === "partyhall" ? "#3b82f6" : "#64748b",
              fontWeight: activeTab === "partyhall" ? "600" : "500",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "all 0.2s",
            }}
          >
            Party Hall Bookings
          </button>
        </div>

        <section className="admin-grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {activeTab === "playground" ? "Playground Bookings" : "Party Hall Bookings"}
              </h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <label style={{ marginRight: "0.5rem", fontSize: "0.875rem" }}>Date:</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div>
                  <label style={{ marginRight: "0.5rem", fontSize: "0.875rem" }}>Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="all">All</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <p style={{ color: "#64748b" }}>Loading bookings...</p>
            ) : activeTab === "playground" ? (
              // Playground Bookings Table
              filteredPlaygroundBookings.length === 0 ? (
                <p style={{ color: "#64748b" }}>No playground bookings found</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.875rem",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc" }}>
                        <th style={tableHeaderStyle}>Date</th>
                        <th style={tableHeaderStyle}>Time</th>
                        <th style={tableHeaderStyle}>User Name</th>
                        <th style={tableHeaderStyle}>Email</th>
                        <th style={tableHeaderStyle}>Apartment</th>
                        <th style={tableHeaderStyle}>Duration</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Booked On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPlaygroundBookings.map((booking) => (
                        <tr key={booking._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={tableCellStyle}>{formatDate(booking.date)}</td>
                          <td style={tableCellStyle}>
                            {booking.startTime} - {booking.endTime}
                          </td>
                          <td style={tableCellStyle}>{booking.userName}</td>
                          <td style={tableCellStyle}>{booking.userId?.email || "N/A"}</td>
                          <td style={tableCellStyle}>{booking.apartmentNumber}</td>
                          <td style={tableCellStyle}>{booking.duration}h</td>
                          <td style={tableCellStyle}>{getStatusBadge(booking.status)}</td>
                          <td style={tableCellStyle}>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              // Party Hall Bookings Table
              filteredPartyHallBookings.length === 0 ? (
                <p style={{ color: "#64748b" }}>No party hall bookings found</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.875rem",
                    }}
                  >
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc" }}>
                        <th style={tableHeaderStyle}>Date</th>
                        <th style={tableHeaderStyle}>Time Slot</th>
                        <th style={tableHeaderStyle}>User Name</th>
                        <th style={tableHeaderStyle}>Email</th>
                        <th style={tableHeaderStyle}>Apartment</th>
                        <th style={tableHeaderStyle}>Event Type</th>
                        <th style={tableHeaderStyle}>Guests</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Booked On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPartyHallBookings.map((booking) => (
                        <tr key={booking._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={tableCellStyle}>{formatDate(booking.date)}</td>
                          <td style={tableCellStyle}>{booking.timeSlot}</td>
                          <td style={tableCellStyle}>{booking.userName}</td>
                          <td style={tableCellStyle}>{booking.userId?.email || "N/A"}</td>
                          <td style={tableCellStyle}>{booking.apartmentNumber}</td>
                          <td style={tableCellStyle}>{booking.eventType}</td>
                          <td style={tableCellStyle}>{booking.numberOfGuests}</td>
                          <td style={tableCellStyle}>{getStatusBadge(booking.status)}</td>
                          <td style={tableCellStyle}>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#f8fafc",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-around",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#1e40af" }}>
                  {activeTab === "playground" 
                    ? filteredPlaygroundBookings.length 
                    : filteredPartyHallBookings.length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Total Bookings</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#059669" }}>
                  {activeTab === "playground"
                    ? filteredPlaygroundBookings.filter((b) => b.status === "confirmed").length
                    : filteredPartyHallBookings.filter((b) => b.status === "confirmed").length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Confirmed</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#dc2626" }}>
                  {activeTab === "playground"
                    ? filteredPlaygroundBookings.filter((b) => b.status === "cancelled").length
                    : filteredPartyHallBookings.filter((b) => b.status === "cancelled").length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Cancelled</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

const tableHeaderStyle = {
  padding: "0.75rem",
  textAlign: "left",
  fontWeight: "600",
  borderBottom: "2px solid #e2e8f0",
  color: "#475569",
};

const tableCellStyle = {
  padding: "0.75rem",
};

export default AdminBookingDetails;
