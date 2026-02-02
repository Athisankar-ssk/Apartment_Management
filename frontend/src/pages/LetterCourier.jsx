import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function LetterCourier() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/user/login");
    }
  }, [navigate]);

  return (
    <>
      <UserNavbar />
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Letter and Courier Notification</h1>
        </header>

        <section className="admin-grid">
          <div className="card">
            <h3>Check Your Letters and Courier Deliveries</h3>
            <p style={{ color: "#64748b", marginTop: "1rem" }}>
              This feature is coming soon. You will receive notifications when letters or courier packages arrive for your apartment.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default LetterCourier;
