import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/jobs", label: "Opportunities", icon: "fas fa-briefcase" },
    { path: "/universities", label: "Universities", icon: "fas fa-university" },
    { path: "/companies", label: "Companies", icon: "fas fa-building" },
    {
      path: "/career-advice",
      label: "Career Advices",
      icon: "fas fa-lightbulb",
    },
    {
      path: "/certifications",
      label: "Certifications",
      icon: "fas fa-certificate",
    },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <i className="fas fa-graduation-cap"></i>
          <span>Yogyata</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${
                isActive(item.path) ? "nav-link--active" : ""
              }`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        {/* User Actions */}
        <div className="navbar-actions">
          <button className="notification-btn">
            <i className="fas fa-bell"></i>
            <span className="notification-badge">3</span>
          </button>
          <div className="user-menu">
            <img
              src="https://via.placeholder.com/32"
              alt="User"
              className="user-avatar"
            />
            <div className="user-dropdown">
              <Link to="/profile">Profile Settings</Link>
              <Link to="/admin">Admin Panel</Link>
              <button>Logout</button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${
                isActive(item.path) ? "mobile-nav-link--active" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
