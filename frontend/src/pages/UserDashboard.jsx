import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function UserDashboard() {
  const name = localStorage.getItem("userName");
  const navigate = useNavigate();

  const serviceCards = [
    {
      title: "Bookings",
      description: "Book facilities like playground, party hall, and swimming pool",
      icon: "📅",
      path: "/user/booking/playground",
      accent: "#0ea5e9"
    },
    {
      title: "Billing",
      description: "View electricity bills and maintenance charges",
      icon: "💳",
      path: "/user/billing/electricity",
      accent: "#f97316"
    },
    {
      title: "Complaints",
      description: "Submit and track grievances about facilities or services",
      icon: "⚠️",
      path: "/user/grievance/electricity",
      accent: "#ef4444"
    },
    {
      title: "Complaint Status",
      description: "Check the status of your submitted complaints",
      icon: "✅",
      path: "/user/services/complaint-status",
      accent: "#10b981"
    },
    {
      title: "My Profile",
      description: "View and update your personal information",
      icon: "👤",
      path: "/user/profile",
      accent: "#8b5cf6"
    },
    {
      title: "Services",
      description: "Request additional services like letter courier",
      icon: "📬",
      path: "/user/services/letter-courier",
      accent: "#6366f1"
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (!userToken) {
      navigate("/user/login");
    }
  }, [navigate]);

  return (
    <>
      <UserNavbar />
      <div className="admin-dashboard user-dashboard--home">
        <header className="admin-hero">
          <div className="admin-hero__content">
            <p className="admin-hero__eyebrow">Resident Portal</p>
            <h1 className="admin-hero__title">Welcome, {name}</h1>
            <p className="admin-hero__subtitle">
              Access your community services, book facilities, pay bills, and manage your account all in one place.
            </p>
          </div>
          <div className="admin-hero__panel">
            <div className="admin-hero__panel-title">Quick Info</div>
            <div className="admin-hero__panel-row">
              <span>Your Account</span>
              <strong>Active</strong>
            </div>
            <div className="admin-hero__panel-row">
              <span>Available Services</span>
              <strong>6+</strong>
            </div>
            <div className="admin-hero__panel-row">
              <span>Support</span>
              <strong>24/7</strong>
            </div>
          </div>
        </header>

        <section className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2 className="admin-section__title">Your Services</h2>
              <p className="admin-section__subtitle">Access all available features and facilities.</p>
            </div>
          </div>
          <div className="admin-card-grid">
            {serviceCards.map((card) => (
              <button
                key={card.title}
                type="button"
                className="admin-card"
                style={{ "--card-accent": card.accent }}
                onClick={() => handleCardClick(card.path)}
              >
                <div className="admin-card__top">
                  <span className="admin-card__icon" aria-hidden="true">{card.icon}</span>
                </div>
                <h3 className="admin-card__title">{card.title}</h3>
                <p className="admin-card__description">{card.description}</p>
                <div className="admin-card__footer">
                  <span>Open service</span>
                  <span aria-hidden="true">→</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section__header">
            <div>
              <h2 className="admin-section__title">Important Information</h2>
              <p className="admin-section__subtitle">Keep yourself updated with community guidelines.</p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            <div
              style={{
                background: "white",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)"
              }}
            >
              <h3 style={{ margin: "0 0 0.75rem", color: "#1e293b", fontSize: "1.1rem" }}>📋 Booking Rules</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Book facilities 24 hours in advance. Cancellations must be made 12 hours before the scheduled time.
              </p>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)"
              }}
            >
              <h3 style={{ margin: "0 0 0.75rem", color: "#1e293b", fontSize: "1.1rem" }}>💰 Payment Due</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Pay your monthly maintenance and utility bills on time. Check your billing section for due dates.
              </p>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)"
              }}
            >
              <h3 style={{ margin: "0 0 0.75rem", color: "#1e293b", fontSize: "1.1rem" }}>🚨 Report Issues</h3>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem", lineHeight: "1.6" }}>
                Found a problem? Use the complaints section to report maintenance or facility issues immediately.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default UserDashboard;
