import React from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function UserDashboard() {
  const name = localStorage.getItem("userName");
  const navigate = useNavigate();

  return (
    <>
      <UserNavbar />

      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Welcome, {name}</h1>
        </header>

        <section className="admin-grid">
          <div className="card">
            <h3>Dashboard</h3>
            <p style={{ color: "#64748b", marginTop: "1rem" }}>
              Welcome to your apartment management dashboard. Use the navigation menu to access services and submit grievances.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default UserDashboard;
