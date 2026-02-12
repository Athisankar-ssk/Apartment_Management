import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminBookingDetails() {
  const navigate = useNavigate();
  const [playgroundBookings, setPlaygroundBookings] = useState([]);
  const [partyHallBookings, setPartyHallBookings] = useState([]);
  const [meetingHallBookings, setMeetingHallBookings] = useState([]);
  const [swimmingPoolBookings, setSwimmingPoolBookings] = useState([]);
  const [vehicleParkingBookings, setVehicleParkingBookings] = useState([]);
  const [filteredPlaygroundBookings, setFilteredPlaygroundBookings] = useState([]);
  const [filteredPartyHallBookings, setFilteredPartyHallBookings] = useState([]);
  const [filteredMeetingHallBookings, setFilteredMeetingHallBookings] = useState([]);
  const [filteredSwimmingPoolBookings, setFilteredSwimmingPoolBookings] = useState([]);
  const [filteredVehicleParkingBookings, setFilteredVehicleParkingBookings] = useState([]);
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
  }, [playgroundBookings, partyHallBookings, meetingHallBookings, swimmingPoolBookings, vehicleParkingBookings, filterDate, filterStatus]);

  const fetchAllBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      if (!token) {
        navigate("/admin/login");
        return;
      }

      // Fetch playground bookings
      try {
        const playgroundRes = await axios.get(
          "http://localhost:5000/api/playground/admin/all-bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlaygroundBookings(playgroundRes.data);
      } catch (error) {
        console.error("Error fetching playground bookings:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminName");
          navigate("/admin/login");
          return;
        }
      }

      // Fetch party hall bookings
      try {
        const partyHallRes = await axios.get(
          "http://localhost:5000/api/partyhall/admin/all-bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPartyHallBookings(partyHallRes.data);
      } catch (error) {
        console.error("Error fetching party hall bookings:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminName");
          navigate("/admin/login");
          return;
        }
      }

      // Fetch meeting hall bookings
      try {
        const meetingHallRes = await axios.get(
          "http://localhost:5000/api/meeting-hall/admin/all-bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMeetingHallBookings(meetingHallRes.data);
      } catch (error) {
        console.error("Error fetching meeting hall bookings:", error);
        // Don't log out on error for this endpoint to prevent accidental logout
      }

      // Fetch swimming pool bookings
      try {
        const swimmingPoolRes = await axios.get(
          "http://localhost:5000/api/swimming-pool/admin/all-bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSwimmingPoolBookings(swimmingPoolRes.data);
      } catch (error) {
        console.error("Error fetching swimming pool bookings:", error);
        // Don't log out on error for this endpoint to prevent accidental logout
      }

      // Fetch vehicle parking bookings
      try {
        const vehicleParkingRes = await axios.get(
          "http://localhost:5000/api/parking/admin/all-bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVehicleParkingBookings(vehicleParkingRes.data);
      } catch (error) {
        console.error("Error fetching vehicle parking bookings:", error);
        // Don't log out on error for this endpoint to prevent accidental logout
      }
    } catch (error) {
      console.error("Error in fetchAllBookings:", error);
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

    // Filter meeting hall bookings
    let filteredMeetingHall = [...meetingHallBookings];
    if (filterDate) {
      filteredMeetingHall = filteredMeetingHall.filter((booking) => booking.date === filterDate);
    }
    if (filterStatus !== "all") {
      filteredMeetingHall = filteredMeetingHall.filter((booking) => booking.status === filterStatus);
    }
    setFilteredMeetingHallBookings(filteredMeetingHall);

    // Filter swimming pool bookings
    let filteredSwimmingPool = [...swimmingPoolBookings];
    if (filterDate) {
      filteredSwimmingPool = filteredSwimmingPool.filter((booking) => booking.date === filterDate);
    }
    if (filterStatus !== "all") {
      filteredSwimmingPool = filteredSwimmingPool.filter((booking) => booking.status === filterStatus);
    }
    setFilteredSwimmingPoolBookings(filteredSwimmingPool);

    // Filter vehicle parking bookings
    let filteredVehicleParking = [...vehicleParkingBookings];
    if (filterStatus !== "all") {
      filteredVehicleParking = filteredVehicleParking.filter((booking) => booking.status === filterStatus);
    }
    setFilteredVehicleParkingBookings(filteredVehicleParking);
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
        <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", borderBottom: "2px solid #e2e8f0", overflowX: "auto" }}>
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
              whiteSpace: "nowrap",
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
              whiteSpace: "nowrap",
            }}
          >
            Party Hall Bookings
          </button>
          <button
            onClick={() => setActiveTab("meetinghall")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === "meetinghall" ? "3px solid #3b82f6" : "3px solid transparent",
              color: activeTab === "meetinghall" ? "#3b82f6" : "#64748b",
              fontWeight: activeTab === "meetinghall" ? "600" : "500",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            Meeting Hall Bookings
          </button>
          <button
            onClick={() => setActiveTab("swimmingpool")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === "swimmingpool" ? "3px solid #3b82f6" : "3px solid transparent",
              color: activeTab === "swimmingpool" ? "#3b82f6" : "#64748b",
              fontWeight: activeTab === "swimmingpool" ? "600" : "500",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            Swimming Pool Bookings
          </button>
          <button
            onClick={() => setActiveTab("vehicleparking")}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeTab === "vehicleparking" ? "3px solid #3b82f6" : "3px solid transparent",
              color: activeTab === "vehicleparking" ? "#3b82f6" : "#64748b",
              fontWeight: activeTab === "vehicleparking" ? "600" : "500",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            Vehicle Parking
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
                {activeTab === "playground" && "Playground Bookings"}
                {activeTab === "partyhall" && "Party Hall Bookings"}
                {activeTab === "meetinghall" && "Meeting Hall Bookings"}
                {activeTab === "swimmingpool" && "Swimming Pool Bookings"}
                {activeTab === "vehicleparking" && "Vehicle Parking Bookings"}
              </h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                {activeTab !== "vehicleparking" && (
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
                )}
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
              <p style={{ color: "#64748b" }}>Loading bookings..</p>
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
            ) : activeTab === "partyhall" ? (
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
            ) : activeTab === "meetinghall" ? (
              // Meeting Hall Bookings Table
              filteredMeetingHallBookings.length === 0 ? (
                <p style={{ color: "#64748b" }}>No meeting hall bookings found</p>
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
                        <th style={tableHeaderStyle}>Attendees</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Booked On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMeetingHallBookings.map((booking) => (
                        <tr key={booking._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={tableCellStyle}>{formatDate(booking.date)}</td>
                          <td style={tableCellStyle}>
                            {booking.startTime} - {booking.endTime}
                          </td>
                          <td style={tableCellStyle}>{booking.userName}</td>
                          <td style={tableCellStyle}>{booking.userId?.email || "N/A"}</td>
                          <td style={tableCellStyle}>{booking.apartmentNumber}</td>
                          <td style={tableCellStyle}>{booking.numberOfAttendees}</td>
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
            ) : activeTab === "swimmingpool" ? (
              // Swimming Pool Bookings Table
              filteredSwimmingPoolBookings.length === 0 ? (
                <p style={{ color: "#64748b" }}>No swimming pool bookings found</p>
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
                        <th style={tableHeaderStyle}>People</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Booked On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSwimmingPoolBookings.map((booking) => (
                        <tr key={booking._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={tableCellStyle}>{formatDate(booking.date)}</td>
                          <td style={tableCellStyle}>
                            {booking.startTime} - {booking.endTime}
                          </td>
                          <td style={tableCellStyle}>{booking.userName}</td>
                          <td style={tableCellStyle}>{booking.userId?.email || "N/A"}</td>
                          <td style={tableCellStyle}>{booking.apartmentNumber}</td>
                          <td style={tableCellStyle}>{booking.numberOfPeople}</td>
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
              // Vehicle Parking Bookings Table
              filteredVehicleParkingBookings.length === 0 ? (
                <p style={{ color: "#64748b" }}>No vehicle parking bookings found</p>
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
                        <th style={tableHeaderStyle}>Parking Slot</th>
                        <th style={tableHeaderStyle}>User Name</th>
                        <th style={tableHeaderStyle}>Email</th>
                        <th style={tableHeaderStyle}>Apartment</th>
                        <th style={tableHeaderStyle}>Vehicle Type</th>
                        <th style={tableHeaderStyle}>Vehicle Number</th>
                        <th style={tableHeaderStyle}>Status</th>
                        <th style={tableHeaderStyle}>Allocated On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVehicleParkingBookings.map((booking) => (
                        <tr key={booking._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={tableCellStyle}>{booking.slotName || booking.slotId}</td>
                          <td style={tableCellStyle}>{booking.userName}</td>
                          <td style={tableCellStyle}>{booking.userId?.email || "N/A"}</td>
                          <td style={tableCellStyle}>{booking.apartmentNumber}</td>
                          <td style={tableCellStyle}>{booking.vehicleType}</td>
                          <td style={tableCellStyle}>{booking.vehicleNumber}</td>
                          <td style={tableCellStyle}>{getStatusBadge(booking.status)}</td>
                          <td style={tableCellStyle}>
                            {booking.approvedDate ? new Date(booking.approvedDate).toLocaleDateString() : new Date(booking.createdAt).toLocaleDateString()}
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
                    : activeTab === "partyhall"
                    ? filteredPartyHallBookings.length
                    : activeTab === "meetinghall"
                    ? filteredMeetingHallBookings.length
                    : activeTab === "swimmingpool"
                    ? filteredSwimmingPoolBookings.length
                    : filteredVehicleParkingBookings.length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Total Bookings</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#059669" }}>
                  {activeTab === "playground"
                    ? filteredPlaygroundBookings.filter((b) => b.status === "confirmed").length
                    : activeTab === "partyhall"
                    ? filteredPartyHallBookings.filter((b) => b.status === "confirmed").length
                    : activeTab === "meetinghall"
                    ? filteredMeetingHallBookings.filter((b) => b.status === "confirmed").length
                    : activeTab === "swimmingpool"
                    ? filteredSwimmingPoolBookings.filter((b) => b.status === "confirmed").length
                    : filteredVehicleParkingBookings.filter((b) => b.status === "approved").length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Confirmed</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "600", color: "#dc2626" }}>
                  {activeTab === "playground"
                    ? filteredPlaygroundBookings.filter((b) => b.status === "cancelled").length
                    : activeTab === "partyhall"
                    ? filteredPartyHallBookings.filter((b) => b.status === "cancelled").length
                    : activeTab === "meetinghall"
                    ? filteredMeetingHallBookings.filter((b) => b.status === "cancelled").length
                    : activeTab === "swimmingpool"
                    ? filteredSwimmingPoolBookings.filter((b) => b.status === "cancelled").length
                    : filteredVehicleParkingBookings.filter((b) => b.status === "rejected" || b.status === "released").length}
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
  color: "rgb(71, 85, 105)",
};

const tableCellStyle = {
  padding: "0.75rem",
};


export default AdminBookingDetails;