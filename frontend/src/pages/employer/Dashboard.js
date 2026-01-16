import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiFilter,
  FiEye,
  FiDownload,
} from "react-icons/fi";
import api from "../../services/api";
import "./Dashboard.css";

const EmployerDashboard = () => {
  const [stats, setStats] = useState({
    totalSearches: 0,
    verifiedToday: 0,
    candidatesReviewed: 0,
    savedCandidates: 0,
  });
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, verificationsRes] = await Promise.all([
        api.get("/employers/stats"),
        api.get("/employers/verifications?limit=10"),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      if (verificationsRes.data.success) {
        setRecentVerifications(verificationsRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Searches",
      value: stats.totalSearches,
      icon: <FiSearch />,
      color: "primary",
    },
    {
      label: "Verified Today",
      value: stats.verifiedToday,
      icon: <FiCheckCircle />,
      color: "success",
    },
    {
      label: "Candidates Reviewed",
      value: stats.candidatesReviewed,
      icon: <FiUsers />,
      color: "secondary",
    },
    {
      label: "Saved Candidates",
      value: stats.savedCandidates,
      icon: <FiTrendingUp />,
      color: "warning",
    },
  ];

  const mockCandidates = [
    {
      id: 1,
      name: "Alex Johnson",
      skills: ["React", "Node.js", "TypeScript"],
      credentials: 5,
      matchScore: 95,
    },
    {
      id: 2,
      name: "Sarah Williams",
      skills: ["Python", "Machine Learning", "Data Science"],
      credentials: 8,
      matchScore: 88,
    },
    {
      id: 3,
      name: "Michael Chen",
      skills: ["Java", "Spring Boot", "AWS"],
      credentials: 6,
      matchScore: 82,
    },
  ];

  return (
    <div className="employer-dashboard">
      <div className="page-header">
        <div>
          <h1>Employer Dashboard</h1>
          <p>Find and verify qualified candidates</p>
        </div>
        <Link to="/employer/search" className="btn btn-primary">
          <FiSearch />
          Search Candidates
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
          <Link to="/verify" className="action-card">
            <div className="action-icon">
              <FiCheckCircle />
            </div>
            <span>Verify Credential</span>
          </Link>
          <Link to="/employer/search" className="action-card">
            <div className="action-icon">
              <FiSearch />
            </div>
            <span>Search Candidates</span>
          </Link>
          <Link to="/employer/saved" className="action-card">
            <div className="action-icon">
              <FiUsers />
            </div>
            <span>Saved Candidates</span>
          </Link>
          <Link to="/employer/reports" className="action-card">
            <div className="action-icon">
              <FiDownload />
            </div>
            <span>Generate Reports</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Verifications */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Verifications</h2>
            <Link to="/employer/verifications" className="view-all">
              View All
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : recentVerifications.length > 0 ? (
            <div className="verifications-list">
              {recentVerifications.map((verification, index) => (
                <div key={index} className="verification-item">
                  <div className="verification-info">
                    <span className="credential-title">
                      {verification.title}
                    </span>
                    <span className="credential-recipient">
                      {verification.recipient_name}
                    </span>
                  </div>
                  <div className={`verification-status ${verification.status}`}>
                    {verification.status === "verified" ? (
                      <FiCheckCircle />
                    ) : (
                      <FiClock />
                    )}
                    {verification.status === "verified"
                      ? "Verified"
                      : "Pending"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent verifications</p>
              <Link to="/verify" className="btn btn-sm btn-outline">
                Verify a Credential
              </Link>
            </div>
          )}
        </div>

        {/* Recommended Candidates */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recommended Candidates</h2>
            <Link to="/employer/search" className="view-all">
              Find More
            </Link>
          </div>

          <div className="candidates-list">
            {mockCandidates.map((candidate) => (
              <div key={candidate.id} className="candidate-card">
                <div className="candidate-header">
                  <div className="candidate-avatar">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="candidate-info">
                    <span className="candidate-name">{candidate.name}</span>
                    <span className="credential-count">
                      {candidate.credentials} verified credentials
                    </span>
                  </div>
                  <div className="match-score">
                    <span className="score">{candidate.matchScore}%</span>
                    <span className="label">Match</span>
                  </div>
                </div>
                <div className="candidate-skills">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="candidate-actions">
                  <button className="btn btn-sm btn-outline">
                    <FiEye />
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
