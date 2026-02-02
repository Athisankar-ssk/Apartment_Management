import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import "./Home.css";

function Home() {
  const token = localStorage.getItem("adminToken");
  const navigate = useNavigate();

  if (token) {
    return <AdminDashboard />;
  }

  return (
    <>
      <Navbar />

      <main className="home-hero">
        <section className="hero-left">
          <h1>Apartment Management System</h1>
          <p className="hero-sub"></p>
          <div className="hero-actions">
            <button 
              onClick={() => navigate('/admin/login')} 
              className="btn primary"
            >
              Admin Login
            </button>
          </div>
        </section> 
      </main>

      
    </>
  );
}

export default Home;
