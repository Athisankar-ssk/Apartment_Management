import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function PartyHallBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [eventType, setEventType] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("");
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    // Set default date to 2 days from now (minimum advance booking)
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    setSelectedDate(twoDaysFromNow.toISOString().split("T")[0]);
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setMessage({ type: "error", text: "Please login to view available slots" });
        navigate("/user/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/partyhall/available-slots/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableSlots(res.data);
      
      const availableCount = res.data.filter(slot => slot.isAvailable).length;
      if (availableCount === 0) {
        setMessage({ type: "error", text: "All time slots are booked for this date" });
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to load available slots";
      setMessage({ type: "error", text: errorMessage });
      // Don't auto-logout on error - let user handle it
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(
        "http://localhost:5000/api/partyhall/my-bookings",
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

    if (!eventType.trim()) {
      setMessage({ type: "error", text: "Please enter the event type" });
      return;
    }

    if (!numberOfGuests || numberOfGuests < 1) {
      setMessage({ type: "error", text: "Please enter the number of guests" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

      const res = await axios.post(
        "http://localhost:5000/api/partyhall/book",
        {
          date: selectedDate,
          timeSlot: selectedSlot,
          eventType,
          numberOfGuests: parseInt(numberOfGuests)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: res.data.message });
      setSelectedSlot(null);
      setEventType("");
      setNumberOfGuests("");
      fetchAvailableSlots();
      fetchMyBookings();
    } catch (error) {
      console.error("Error booking party hall:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to book party hall",
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
        `http://localhost:5000/api/partyhall/cancel/${bookingId}`,
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

  const getMinDate = () => {
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    return twoDaysFromNow.toISOString().split("T")[0];
  };

  const canCancelBooking = (booking) => {
    const now = new Date();
    const bookingCreatedAt = new Date(booking.createdAt);
    const hoursSinceBooking = (now - bookingCreatedAt) / (1000 * 60 * 60);
    return hoursSinceBooking <= 24;
  };

  return (
    <>
      <UserNavbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Party Hall Booking</h1>
          <p style={{ fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }}>
            Book the party hall at least 2 days in advance. Only 3 time slots available per day.
          </p>
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
            <h3>Book Party Hall</h3>
            <div style={{ marginTop: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "500",
                }}
              >
                Select Date (Minimum 2 days in advance):
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
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
                  {availableSlots.length === 0 ? (
                    <p style={{ color: "#64748b" }}>
                      No available slots for the selected date
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.timeSlot}
                          onClick={() => slot.isAvailable && setSelectedSlot(slot.timeSlot)}
                          disabled={!slot.isAvailable}
                          style={{
                            padding: "0.75rem",
                            border:
                              selectedSlot === slot.timeSlot
                                ? "2px solid #3b82f6"
                                : "1px solid #e2e8f0",
                            borderRadius: "4px",
                            backgroundColor: !slot.isAvailable
                              ? "#f1f5f9"
                              : selectedSlot === slot.timeSlot
                              ? "#dbeafe"
                              : "white",
                            cursor: slot.isAvailable ? "pointer" : "not-allowed",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>{slot.timeSlot}</span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: slot.isAvailable ? "#10b981" : "#ef4444",
                              fontWeight: "600",
                            }}
                          >
                            {slot.isAvailable ? "Available" : "Booked"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedSlot && (
                    <>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                        }}
                      >
                        Event Type:
                      </label>
                      <input
                        type="text"
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        placeholder="e.g., Birthday Party, Anniversary, etc."
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
                        Number of Guests:
                      </label>
                      <input
                        type="number"
                        value={numberOfGuests}
                        onChange={(e) => setNumberOfGuests(e.target.value)}
                        placeholder="Expected number of guests"
                        min="1"
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "4px",
                          marginBottom: "1rem",
                        }}
                      />
                    </>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!selectedSlot || loading}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      backgroundColor: selectedSlot && !loading ? "#3b82f6" : "#94a3b8",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: selectedSlot && !loading ? "pointer" : "not-allowed",
                      fontWeight: "500",
                    }}
                  >
                    {loading ? "Booking..." : "Book Party Hall"}
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
                  {myBookings.map((booking) => {
                    const canCancel = canCancelBooking(booking);
                    return (
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
                        </div>
                        <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                          <strong>Time:</strong> {booking.timeSlot}
                        </p>
                        <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                          <strong>Event:</strong> {booking.eventType}
                        </p>
                        <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                          <strong>Guests:</strong> {booking.numberOfGuests}
                        </p>
                        {canCancel ? (
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
                        ) : (
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#f59e0b",
                              fontStyle: "italic",
                              marginTop: "0.5rem",
                            }}
                          >
                            ⚠️ Cancellation period expired (24 hours limit)
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default PartyHallBooking;
