import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiAward,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiMessageCircle,
} from "react-icons/fi";
import ChatbotWidget from "../components/common/ChatbotWidget";
import "./DashboardLayout.css";

const DashboardLayout = ({ role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { path: "/student/dashboard", icon: <FiHome />, label: "Dashboard" },
          {
            path: "/student/credentials",
            icon: <FiAward />,
            label: "My Credentials",
          },
          {
            path: "/student/recommendations",
            icon: <FiStar />,
            label: "Recommendations",
          },
          { path: "/student/profile", icon: <FiUser />, label: "Profile" },
        ];
      case "institution":
        return [
          {
            path: "/institution/dashboard",
            icon: <FiHome />,
            label: "Dashboard",
          },
          {
            path: "/institution/issue",
            icon: <FiPlusCircle />,
            label: "Issue Credential",
          },
          {
            path: "/institution/credentials",
            icon: <FiAward />,
            label: "Issued Credentials",
          },
          { path: "/institution/profile", icon: <FiUser />, label: "Profile" },
        ];
      case "employer":
        return [
          { path: "/employer/dashboard", icon: <FiHome />, label: "Dashboard" },
          {
            path: "/verify",
            icon: <FiCheckCircle />,
            label: "Verify Credential",
          },
          {
            path: "/employer/verifications",
            icon: <FiClock />,
            label: "Verification History",
          },
          { path: "/employer/profile", icon: <FiUser />, label: "Profile" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <header className="dashboard-header mobile-only">
        <button
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="header-logo">
          <span className="logo-text">Yogyata</span>
        </div>
        <div className="header-user">
          <span className="user-role">{roleTitle}</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">Y</span>
            <span className="logo-text">Yogyata</span>
          </div>
          <span className="role-badge">{roleTitle}</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.user_metadata?.full_name?.charAt(0) || "U"}
            </div>
            <div className="user-details">
              <span className="user-name">
                {user?.user_metadata?.full_name || "User"}
              </span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        <Outlet />
      </main>

      {/* Chatbot FAB */}
      <button
        className="chatbot-fab"
        onClick={() => setChatbotOpen(!chatbotOpen)}
        title="AI Assistant"
      >
        <FiMessageCircle />
      </button>

      {/* Chatbot Widget */}
      {chatbotOpen && (
        <ChatbotWidget onClose={() => setChatbotOpen(false)} userRole={role} />
      )}
    </div>
  );
};

export default DashboardLayout;
