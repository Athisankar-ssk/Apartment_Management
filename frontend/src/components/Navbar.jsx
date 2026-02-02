import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon"></span>
          Apartment
        </Link>

        <div className="spacer" />

        <div className="navbar-actions">
          {/* Show Dashboard and Complaints on admin pages */}
          {adminToken && (location.pathname === '/admin/dashboard' || location.pathname === '/admin/create-account' || location.pathname === '/complaints' || location.pathname === '/user-management' || location.pathname === '/admin/booking-details') && (
            <>
              <Link to="/admin/dashboard" className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/admin/create-account" className={`nav-link ${location.pathname === '/admin/create-account' ? 'active' : ''}`}>
                Create Account
              </Link>
              <Link to="/complaints" className={`nav-link ${location.pathname === '/complaints' ? 'active' : ''}`}>
                Complaints
              </Link>
              <Link to="/admin/booking-details" className={`nav-link ${location.pathname === '/admin/booking-details' ? 'active' : ''}`}>
                Booking Details
              </Link>
            </>
          )}

          {/* Show user-specific navigation on user dashboard */}
          {userToken && location.pathname === '/user/dashboard' && (
            <>
              <Link to="/user/dashboard" className={`nav-link ${location.pathname === '/user/dashboard' ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/complaints" className={`nav-link ${location.pathname === '/complaints' ? 'active' : ''}`}>
                Complaints
              </Link>
            </>
          )}

          {/* Show logout for admin or user, otherwise show login options */}
          {adminToken || userToken ? (
            <>
              <button className="btn outline-small" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            // If not logged in, show User Login and Admin Login
            <>
              <Link to="/user/login" className={`btn outline-small ${location.pathname === '/user/login' ? 'active' : ''}`}>
                User Login
              </Link>
              <Link to="/admin/login" className={`btn outline-small ${location.pathname === '/admin/login' ? 'active' : ''}`}>
                Admin Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
