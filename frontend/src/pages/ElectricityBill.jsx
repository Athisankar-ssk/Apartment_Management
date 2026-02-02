import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import "./AdminDashboard.css";

function ElectricityBill() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);

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
          <h1>Electricity Bill</h1>
        </header>

        <section className="admin-grid">
          <div className="card">
            <h3>View and Pay Electricity Bill</h3>
            <p style={{ color: "#64748b", marginTop: "1rem" }}>
              This feature is coming soon. You will be able to view your monthly electricity bills and make payments here.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

export default ElectricityBill;
