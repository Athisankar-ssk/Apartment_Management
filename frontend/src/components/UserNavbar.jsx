import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

function UserNavbar() {
  const navigate = useNavigate();
  const [showGrievanceDropdown, setShowGrievanceDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showBookingDropdown, setShowBookingDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get(
        "http://localhost:5000/api/user/profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserDetails(res.data);
    } catch (err) {
      console.error("Error fetching user details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-icon"></span>
          Apartment
        </div>

        <div className="spacer" />

        <div className="navbar-actions">
          <button className="nav-link" onClick={() => navigate('/user/dashboard')}>
            Dashboard
          </button>
          <div 
            className="dropdown"
            onMouseEnter={() => setShowGrievanceDropdown(true)}
            onMouseLeave={() => setShowGrievanceDropdown(false)}
          >
            <button className="nav-link">
              Grievance
            </button>
            {showGrievanceDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate('/user/grievance/electricity')}>
                  Electricity
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/grievance/water')}>
                  Water
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/grievance/cleaning')}>
                  Cleaning Complaint
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/grievance/lift')}>
                  Lift
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/grievance/other')}>
                  Other Complaints
                </button>
              </div>
            )}
          </div>
          <div 
            className="dropdown"
            onMouseEnter={() => setShowServicesDropdown(true)}
            onMouseLeave={() => setShowServicesDropdown(false)}
          >
            <button className="nav-link">
              Services
            </button>
            {showServicesDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate('/user/services/electricity-bill')}>
                  Electricity Bill
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/services/complaint-status')}>
                  Complaint Status
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/services/letter-courier')}>
                  Letter and Courier Notification
                </button>
              </div>
            )}
          </div>
          <div 
            className="dropdown"
            onMouseEnter={() => setShowBookingDropdown(true)}
            onMouseLeave={() => setShowBookingDropdown(false)}
          >
            <button className="nav-link">
              Booking
            </button>
            {showBookingDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate('/user/booking/playground')}>
                  Playground Booking
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/booking/partyhall')}>
                  Party Hall Booking
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/booking/meeting-hall')}>
                  Meeting Hall Booking
                </button>
                <button className="dropdown-item" onClick={() => navigate('/user/booking/swimming-pool')}>
                  Swimming Pool Booking
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="navbar-right">
          <button className="btn outline-small" onClick={handleLogout}>
            Logout
          </button>
          <div 
            className="dropdown profile-dropdown"
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <button 
              className="profile-icon" 
              title="Profile"
              onClick={() => navigate('/user/profile')}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#475569" strokeWidth="2" fill="#f1f5f9"/>
                <path d="M16 16c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#475569"/>
              </svg>
            </button>
            {showProfileDropdown && (
              <div className="dropdown-menu profile-menu">
                <div className="profile-header">
                  <h4>Profile Details</h4>
                </div>
                {loading ? (
                  <div className="profile-content">
                    <p>Loading...</p>
                  </div>
                ) : userDetails ? (
                  <div className="profile-content">
                    <div className="profile-item">
                      <span className="profile-label">Name:</span>
                      <span className="profile-value">{userDetails.name}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Email:</span>
                      <span className="profile-value">{userDetails.email}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">User ID:</span>
                      <span className="profile-value">{userDetails.userId}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Apartment:</span>
                      <span className="profile-value">{userDetails.apartmentNumber || "N/A"}</span>
                    </div>
                    <div className="profile-item">
                      <span className="profile-label">Mobile:</span>
                      <span className="profile-value">{userDetails.mobile || "N/A"}</span>
                    </div>
                    <button 
                      className="view-full-profile-btn" 
                      onClick={() => navigate('/user/profile')}
                    >
                      View Full Profile
                    </button>
                  </div>
                ) : (
                  <div className="profile-content">
                    <p>Unable to load details</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default UserNavbar;
