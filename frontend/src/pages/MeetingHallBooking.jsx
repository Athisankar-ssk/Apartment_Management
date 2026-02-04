import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function MeetingHallBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [numberOfAttendees, setNumberOfAttendees] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Set default date to today
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedDuration) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedDuration]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      setSelectedSlot(null); // Reset slot when duration changes
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setMessage({ type: "error", text: "Please login to view available slots" });
        navigate("/user/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/meeting-hall/available-slots/${selectedDate}/${selectedDuration}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableSlots(res.data);
      
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No available slots for the selected date and duration" });
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load available slots";
      setMessage({ type: "error", text: errorMessage });
      
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
        navigate("/user/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(
        "http://localhost:5000/api/meeting-hall/my-bookings",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      setMessage({ type: "error", text: "Please select a time slot" });
      return;
    }

    if (!meetingPurpose.trim()) {
      setMessage({ type: "error", text: "Please enter the meeting purpose" });
      return;
    }

    if (!numberOfAttendees || numberOfAttendees < 1 || numberOfAttendees > 20) {
      setMessage({ type: "error", text: "Number of attendees must be between 1 and 20" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

      const res = await axios.post(
        "http://localhost:5000/api/meeting-hall/book",
        {
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          duration: selectedDuration,
          meetingPurpose,
          numberOfAttendees: parseInt(numberOfAttendees),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: res.data.message });
      setSelectedSlot(null);
      setMeetingPurpose("");
      setNumberOfAttendees("");
      fetchAvailableSlots();
      fetchMyBookings();
    } catch (error) {
      console.error("Error booking meeting hall:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to book meeting hall",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.delete(
        `http://localhost:5000/api/meeting-hall/cancel/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: res.data.message });
      fetchMyBookings();
      fetchAvailableSlots();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to cancel booking",
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredSlots = availableSlots;

  return (
    <>
      <UserNavbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Meeting Hall Booking</h1>
        </header>

        {message.text && (
          <div
            className={`message ${message.type}`}
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
              color: message.type === "success" ? "#155724" : "#721c24",
              border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`,
            }}
          >
            {message.text}
          </div>
        )}

        <section className="admin-grid">
          <div className="card">
            <h3>Book Meeting Hall</h3>
            <div style={{ marginTop: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Select Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              />

              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Duration:
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              >
                <option value={1}>1 hour</option>
                <option value={2}>2 hours</option>
                <option value={3}>3 hours</option>
              </select>

              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Meeting Purpose:
              </label>
              <input
                type="text"
                value={meetingPurpose}
                onChange={(e) => setMeetingPurpose(e.target.value)}
                placeholder="e.g., Society Meeting, Event Planning"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              />

              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Number of Attendees (1-20):
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={numberOfAttendees}
                onChange={(e) => setNumberOfAttendees(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #e2e8f0",
                  borderRadius: "4px",
                  marginBottom: "1rem",
                }}
              />

              {loading ? (
                <p style={{ color: "#64748b" }}>Loading available slots...</p>
              ) : (
                <>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Available Time Slots:
                  </label>
                  {filteredSlots.length === 0 ? (
                    <p style={{ color: "#64748b" }}>
                      No available slots for the selected date and duration
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {filteredSlots.map((slot) => (
                        <button
                          key={`${slot.startTime}-${slot.endTime}`}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: "0.75rem",
                            border:
                              selectedSlot?.startTime === slot.startTime
                                ? "2px solid #3b82f6"
                                : "1px solid #e2e8f0",
                            borderRadius: "4px",
                            backgroundColor:
                              selectedSlot?.startTime === slot.startTime
                                ? "#dbeafe"
                                : "white",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                          }}
                        >
                          <div style={{ fontWeight: "600" }}>
                            {slot.startTime} - {slot.endTime}
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#10b981",
                              fontWeight: "600",
                              marginTop: "0.25rem",
                            }}
                          >
                            Available
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!selectedSlot || !meetingPurpose || !numberOfAttendees || loading}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      backgroundColor: selectedSlot && meetingPurpose && numberOfAttendees && !loading ? "#3b82f6" : "#94a3b8",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: selectedSlot && meetingPurpose && numberOfAttendees && !loading ? "pointer" : "not-allowed",
                      fontWeight: "500",
                    }}
                  >
                    {loading ? "Booking..." : "Book Meeting Hall"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3>My Bookings</h3>
            <div style={{ marginTop: "1rem" }}>
              {myBookings.length === 0 ? (
                <p style={{ color: "#64748b" }}>No bookings yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {myBookings.map((booking) => (
                    <div
                      key={booking._id}
                      style={{
                        padding: "1rem",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <strong>{formatDate(booking.date)}</strong>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                          }}
                        >
                          {booking.duration}h
                        </span>
                      </div>
                      <p style={{ color: "#64748b", marginBottom: "0.25rem" }}>
                        Time: {booking.startTime} - {booking.endTime}
                      </p>
                      <p style={{ color: "#64748b", marginBottom: "0.25rem" }}>
                        Purpose: {booking.meetingPurpose}
                      </p>
                      <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                        Attendees: {booking.numberOfAttendees}
                      </p>
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        Cancel Booking
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default MeetingHallBooking;
