import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    const role = user.user_metadata?.role;
    return `/${role}/dashboard`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">Y</span>
          <span className="logo-text">Yogyata</span>
        </Link>

        <div className={`navbar-menu ${mobileMenuOpen ? "open" : ""}`}>
          <Link
            to="/"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/verify"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Verify Credential
          </Link>
          <a
            href="#features"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#about"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </a>

          {user ? (
            <div className="nav-auth">
              <Link
                to={getDashboardLink()}
                className="btn btn-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button
                className="btn btn-outline"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link
                to="/login"
                className="btn btn-outline"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
