import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiAward,
  FiUsers,
  FiClock,
  FiTrendingUp,
  FiPlus,
  FiSearch,
  FiFilter,
  FiMoreVertical,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../../services/api";
import "./Dashboard.css";

const InstitutionDashboard = () => {
  const [stats, setStats] = useState({
    totalIssued: 0,
    pendingVerification: 0,
    totalStudents: 0,
    thisMonth: 0,
  });
  const [recentCredentials, setRecentCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, credentialsRes] = await Promise.all([
        api.get("/institutions/stats"),
        api.get("/institutions/credentials?limit=10"),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (credentialsRes.data.success) {
        setRecentCredentials(credentialsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Issued",
      value: stats.totalIssued,
      icon: <FiAward />,
      color: "primary",
    },
    {
      label: "Pending Verification",
      value: stats.pendingVerification,
      icon: <FiClock />,
      color: "warning",
    },
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: <FiUsers />,
      color: "secondary",
    },
    {
      label: "Issued This Month",
      value: stats.thisMonth,
      icon: <FiTrendingUp />,
      color: "success",
    },
  ];

  const filteredCredentials = recentCredentials.filter((cred) => {
    const matchesSearch =
      cred.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cred.recipient_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || cred.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <span className="status-badge verified">
            <FiCheckCircle /> Verified
          </span>
        );
      case "pending_blockchain":
        return (
          <span className="status-badge pending">
            <FiClock /> Pending
          </span>
        );
      case "revoked":
        return (
          <span className="status-badge revoked">
            <FiAlertCircle /> Revoked
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="institution-dashboard">
      <div className="page-header">
        <div>
          <h1>Institution Dashboard</h1>
          <p>Manage and issue blockchain-verified credentials</p>
        </div>
        <Link to="/institution/issue" className="btn btn-primary">
          <FiPlus />
          Issue New Credential
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <span className="stat-value">{loading ? "..." : stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/institution/issue" className="action-card">
            <div className="action-icon">
              <FiPlus />
            </div>
            <span>Issue Single Credential</span>
          </Link>
          <Link to="/institution/bulk-issue" className="action-card">
            <div className="action-icon">
              <FiUsers />
            </div>
            <span>Bulk Issue (CSV)</span>
          </Link>
          <Link to="/institution/templates" className="action-card">
            <div className="action-icon">
              <FiAward />
            </div>
            <span>Manage Templates</span>
          </Link>
          <Link to="/institution/analytics" className="action-card">
            <div className="action-icon">
              <FiTrendingUp />
            </div>
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Credentials */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Credentials</h2>
          <Link to="/institution/credentials" className="view-all">
            View All
          </Link>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title or recipient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <FiFilter />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending_blockchain">Pending</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading credentials...</div>
        ) : filteredCredentials.length > 0 ? (
          <div className="credentials-table">
            <div className="table-header">
              <span className="col-title">Credential</span>
              <span className="col-recipient">Recipient</span>
              <span className="col-date">Issue Date</span>
              <span className="col-status">Status</span>
              <span className="col-actions"></span>
            </div>
            {filteredCredentials.map((cred) => (
              <div key={cred.id} className="table-row">
                <div className="col-title">
                  <span className="cred-title">{cred.title}</span>
                  <span className="cred-id">ID: {cred.id.slice(0, 8)}...</span>
                </div>
                <div className="col-recipient">
                  <span className="recipient-name">
                    {cred.recipient_name || "N/A"}
                  </span>
                  <span className="recipient-email">
                    {cred.recipient_email}
                  </span>
                </div>
                <div className="col-date">
                  {new Date(cred.created_at).toLocaleDateString()}
                </div>
                <div className="col-status">{getStatusBadge(cred.status)}</div>
                <div className="col-actions">
                  <button className="action-btn">
                    <FiMoreVertical />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h3>No Credentials Found</h3>
            <p>Start by issuing your first credential</p>
            <Link to="/institution/issue" className="btn btn-primary">
              <FiPlus />
              Issue Credential
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionDashboard;
