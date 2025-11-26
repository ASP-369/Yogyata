import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState(["main"]);

  const isActive = (path) => location.pathname === path;

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const menuItems = [
    {
      id: "main",
      title: "Main Navigation",
      items: [
        { path: "/", label: "Dashboard", icon: "fas fa-tachometer-alt" },
        { path: "/profile", label: "Profile", icon: "fas fa-user-circle" },
        {
          path: "/credentials",
          label: "My Credentials",
          icon: "fas fa-certificate",
        },
        { path: "/jobs", label: "Job Search", icon: "fas fa-search" },
      ],
    },
    {
      id: "tools",
      title: "Tools & Services",
      items: [
        { path: "/ai-assistant", label: "AI Assistant", icon: "fas fa-robot" },
        {
          path: "/verification",
          label: "Verify Credentials",
          icon: "fas fa-shield-check",
        },
        {
          path: "/blockchain",
          label: "Blockchain Explorer",
          icon: "fas fa-link",
        },
        { path: "/analytics", label: "Analytics", icon: "fas fa-chart-line" },
      ],
    },
    {
      id: "admin",
      title: "Administration",
      items: [
        { path: "/admin", label: "Admin Dashboard", icon: "fas fa-cogs" },
        {
          path: "/admin/users",
          label: "User Management",
          icon: "fas fa-users",
        },
        {
          path: "/admin/credentials",
          label: "Credential Management",
          icon: "fas fa-award",
        },
      ],
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}

      <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <i className="fas fa-graduation-cap"></i>
            <span>Yogyata</span>
          </Link>
          <button className="sidebar-toggle" onClick={onToggle}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((section) => (
            <div key={section.id} className="nav-section">
              <button
                className="nav-section-header"
                onClick={() => toggleSection(section.id)}
              >
                <span>{section.title}</span>
                <i
                  className={`fas fa-chevron-${
                    expandedSections.includes(section.id) ? "down" : "right"
                  }`}
                ></i>
              </button>

              {expandedSections.includes(section.id) && (
                <div className="nav-section-content">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${
                        isActive(item.path) ? "nav-item--active" : ""
                      }`}
                      onClick={() => window.innerWidth <= 768 && onToggle()}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="user-avatar-sidebar"
            />
            <div className="user-details">
              <span className="user-name">John Doe</span>
              <span className="user-role">Student</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
