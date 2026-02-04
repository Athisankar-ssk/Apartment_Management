import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function SwimmingPoolBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [numberOfPeople, setNumberOfPeople] = useState("");
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
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" }); // Clear previous messages
      const token = localStorage.getItem("userToken");
      
      if (!token) {
        setMessage({ type: "error", text: "Please login to view available slots" });
        navigate("/user/login");
        return;
      }

      const res = await axios.get(
        `http://localhost:5000/api/swimming-pool/available-slots/${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableSlots(res.data);
      
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No available slots for the selected date" });
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
        "http://localhost:5000/api/swimming-pool/my-bookings",
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

    if (!numberOfPeople || numberOfPeople < 1 || numberOfPeople > 10) {
      setMessage({ type: "error", text: "Number of people must be between 1 and 10" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      
      // Calculate end time (always 1 hour)
      const startHour = parseInt(selectedSlot.startTime.split(":")[0]);
      const endHour = startHour + 1;
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;

      const res = await axios.post(
        "http://localhost:5000/api/swimming-pool/book",
        {
          date: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: endTime,
          duration: 1,
          numberOfPeople: parseInt(numberOfPeople),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: res.data.message });
      setSelectedSlot(null);
      setNumberOfPeople("");
      fetchAvailableSlots();
      fetchMyBookings();
    } catch (error) {
      console.error("Error booking swimming pool:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to book swimming pool",
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
        `http://localhost:5000/api/swimming-pool/cancel/${bookingId}`,
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
          <h1>Swimming Pool Booking</h1>
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
            <h3>Book Swimming Pool</h3>
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
                Number of People (1-10):
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(e.target.value)}
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
                      No available slots for the selected date
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                        gap: "0.5rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {filteredSlots.map((slot) => {
                        const endHour = parseInt(slot.startTime.split(":")[0]) + 1;
                        const displayEndTime = `${endHour.toString().padStart(2, "0")}:00`;
                        const peopleCount = slot.peopleCount || 0;
                        
                        return (
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
                            <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                              {slot.startTime} - {displayEndTime}
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: peopleCount < 10 ? "#10b981" : peopleCount < 20 ? "#3b82f6" : "#f59e0b",
                                fontWeight: "600",
                                marginTop: "0.25rem",
                              }}
                            >
                              {peopleCount}/30 People
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <button
                    onClick={handleBooking}
                    disabled={!selectedSlot || !numberOfPeople || loading}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      backgroundColor: selectedSlot && numberOfPeople && !loading ? "#3b82f6" : "#94a3b8",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: selectedSlot && numberOfPeople && !loading ? "pointer" : "not-allowed",
                      fontWeight: "500",
                    }}
                  >
                    {loading ? "Booking..." : "Book Swimming Pool"}
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
                          {booking.numberOfPeople} People
                        </span>
                      </div>
                      <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>
                        Time: {booking.startTime} - {booking.endTime}
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

export default SwimmingPoolBooking;
