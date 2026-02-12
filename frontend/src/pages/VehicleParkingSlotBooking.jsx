import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function VehicleParkingSlotBooking() {
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [allocatedSlot, setAllocatedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAvailableSlots();
    fetchAllocatedSlot();
  }, []);

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
        "http://localhost:5000/api/parking/available-slots",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableSlots(res.data);
      
      if (res.data.length === 0) {
        setMessage({ type: "error", text: "No parking slots available at the moment" });
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

  const fetchAllocatedSlot = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(
        "http://localhost:5000/api/parking/my-slot",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllocatedSlot(res.data);
    } catch (error) {
      console.error("Error fetching allocated slot:", error);
      // It's okay if there's no allocated slot yet
    }
  };

  const handleRequestSlot = async () => {
    if (!selectedSlot) {
      setMessage({ type: "error", text: "Please select a parking slot" });
      return;
    }

    if (!vehicleNumber.trim()) {
      setMessage({ type: "error", text: "Please enter the vehicle number" });
      return;
    }

    if (!vehicleType.trim()) {
      setMessage({ type: "error", text: "Please select the vehicle type" });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");
      
      const res = await axios.post(
        "http://localhost:5000/api/parking/request-slot",
        {
          slotId: selectedSlot.id,
          slotName: selectedSlot.name,
          vehicleNumber,
          vehicleType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: "Parking slot requested successfully! Waiting for admin approval." });
      setSelectedSlot(null);
      setVehicleNumber("");
      setVehicleType("");
      fetchAvailableSlots();
      fetchAllocatedSlot();
    } catch (error) {
      console.error("Error requesting slot:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to request slot";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseSlot = async () => {
    if (window.confirm("Are you sure you want to release this parking slot?")) {
      try {
        setLoading(true);
        const token = localStorage.getItem("userToken");
        
        await axios.post(
          `http://localhost:5000/api/parking/release-slot`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessage({ type: "success", text: "Parking slot released successfully!" });
        setAllocatedSlot(null);
        fetchAvailableSlots();
      } catch (error) {
        console.error("Error releasing slot:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to release slot";
        setMessage({ type: "error", text: errorMessage });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <UserNavbar />
      <div className="container" style={{ padding: "2rem" }}>
        <h1>Vehicle Parking Slot Management</h1>

        {message.text && (
          <div className={`alert alert-${message.type}`} style={{ marginBottom: "1rem" }}>
            {message.text}
          </div>
        )}

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "2rem",
          marginBottom: "2rem"
        }}>
          {/* Request Parking Slot Form */}
          <div style={{ 
            border: "1px solid #ddd", 
            padding: "1.5rem", 
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2>Request Parking Slot</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              Select an available parking slot to permanently allocate to your vehicle. Once approved by the admin, the slot will be assigned to you.
            </p>
            
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              >
                <option value="">Select Vehicle Type</option>
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Scooter">Scooter</option>
                <option value="SUV">SUV</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Vehicle Number
              </label>
              <input
                type="text"
                placeholder="e.g., AP 29 AB 1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  fontSize: "1rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
                Available Parking Slots
              </label>
              {loading ? (
                <p>Loading available slots...</p>
              ) : availableSlots.length > 0 ? (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                  maxHeight: "300px",
                  overflowY: "auto"
                }}>
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      style={{
                        padding: "0.75rem",
                        border: selectedSlot?.id === slot.id ? "2px solid #007bff" : "1px solid #ddd",
                        borderRadius: "4px",
                        backgroundColor: selectedSlot?.id === slot.id ? "#e7f3ff" : "#fff",
                        cursor: "pointer",
                        fontWeight: selectedSlot?.id === slot.id ? "600" : "400"
                      }}
                    >
                      {slot.name || slot.id}
                      <br />
                      <small>Available</small>
                    </button>
                  ))}
                </div>
              ) : (
                <p>No slots available at the moment</p>
              )}
            </div>

            <button
              onClick={handleRequestSlot}
              disabled={loading || !selectedSlot || !vehicleNumber || !vehicleType}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: !loading && selectedSlot && vehicleNumber && vehicleType ? "#007bff" : "#ccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: !loading && selectedSlot && vehicleNumber && vehicleType ? "pointer" : "not-allowed"
              }}
            >
              {loading ? "Requesting..." : "Request Slot"}
            </button>
          </div>

          {/* My Allocated Slot */}
          <div style={{ 
            border: "1px solid #ddd", 
            padding: "1.5rem", 
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2>My Allocated Slot</h2>
            {allocatedSlot ? (
              <div style={{
                padding: "1.5rem",
                border: "2px solid #28a745",
                borderRadius: "8px",
                backgroundColor: "#f0f8f5"
              }}>
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    <strong>Parking Slot:</strong> <span style={{ fontSize: "1.2rem", color: "#007bff" }}>{allocatedSlot.slotName || allocatedSlot.slotId}</span>
                  </p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    <strong>Vehicle Type:</strong> {allocatedSlot.vehicleType}
                  </p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    <strong>Vehicle Number:</strong> {allocatedSlot.vehicleNumber}
                  </p>
                  <p style={{ margin: "0 0 0.5rem 0" }}>
                    <strong>Status:</strong> <span style={{ 
                      color: allocatedSlot.status === "approved" ? "green" : allocatedSlot.status === "pending" ? "orange" : "red",
                      fontWeight: "600"
                    }}>
                      {allocatedSlot.status ? allocatedSlot.status.charAt(0).toUpperCase() + allocatedSlot.status.slice(1) : "Active"}
                    </span>
                  </p>
                  {allocatedSlot.approvedDate && (
                    <p style={{ margin: "0 0 0.5rem 0" }}>
                      <strong>Allocated Since:</strong> {new Date(allocatedSlot.approvedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleReleaseSlot}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600"
                  }}
                >
                  Release Slot
                </button>
              </div>
            ) : (
              <div style={{
                padding: "2rem",
                border: "2px dashed #ccc",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
                textAlign: "center",
                color: "#666"
              }}>
                <p>No parking slot allocated yet.</p>
                <p style={{ fontSize: "0.9rem" }}>Submit a request above to get a permanent parking slot assigned to you.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VehicleParkingSlotBooking;
