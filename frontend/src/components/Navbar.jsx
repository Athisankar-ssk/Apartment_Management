import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("userToken");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminName");
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    navigate("/");
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon"></span>
          Apartment
        </Link>

        <div className="spacer" />

        <button
          className="menu-toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
        >
          <span className="menu-bar" />
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>

        <div className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
          <div className="navbar-actions">
            {/* Show Dashboard and Complaints on admin pages */}
            {adminToken && (location.pathname === '/admin/dashboard' || location.pathname === '/admin/create-account' || location.pathname === '/complaints' || location.pathname === '/user-management' || location.pathname === '/admin/booking-details' || location.pathname === '/admin/billing') && (
              <>
                <Link to="/admin/dashboard" onClick={handleNavClick} className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/admin/create-account" onClick={handleNavClick} className={`nav-link ${location.pathname === '/admin/create-account' ? 'active' : ''}`}>
                  Create Account
                </Link>
                <Link to="/complaints" onClick={handleNavClick} className={`nav-link ${location.pathname === '/complaints' ? 'active' : ''}`}>
                  Complaints
                </Link>
                <Link to="/admin/booking-details" onClick={handleNavClick} className={`nav-link ${location.pathname === '/admin/booking-details' ? 'active' : ''}`}>
                  Booking Details
                </Link>
                <Link to="/admin/billing" onClick={handleNavClick} className={`nav-link ${location.pathname === '/admin/billing' ? 'active' : ''}`}>
                  Billing
                </Link>
              </>
            )}

            {/* Show user-specific navigation on user dashboard */}
            {userToken && location.pathname === '/user/dashboard' && (
              <>
                <Link to="/user/dashboard" onClick={handleNavClick} className={`nav-link ${location.pathname === '/user/dashboard' ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/complaints" onClick={handleNavClick} className={`nav-link ${location.pathname === '/complaints' ? 'active' : ''}`}>
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
                <Link to="/user/login" onClick={handleNavClick} className={`btn outline-small ${location.pathname === '/user/login' ? 'active' : ''}`}>
                  User Login
                </Link>
                <Link to="/admin/login" onClick={handleNavClick} className={`btn outline-small ${location.pathname === '/admin/login' ? 'active' : ''}`}>
                  Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
