import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiAward,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiArrowRight,
  FiSearch,
  FiUpload,
} from "react-icons/fi";
import api from "../../services/api";
import CredentialCard from "../../components/credentials/CredentialCard";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCredentials: 0,
    verifiedCredentials: 0,
    pendingCredentials: 0,
    totalSkills: 0,
    skills: [],
  });
  const [recentCredentials, setRecentCredentials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, credentialsRes] = await Promise.all([
        api.get("/students/stats"),
        api.get("/students/credentials?limit=4"),
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

  const truncateAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>
            Welcome back,{" "}
            {user?.user_metadata?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p>Manage your verified credentials and track your skills</p>
        </div>
        <div className="header-actions">
          <Link to="/student/recommendations" className="btn btn-outline">
            <FiStar />
            AI Recommendations
          </Link>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="profile-summary">
        <div className="profile-avatar">
          {user?.user_metadata?.full_name?.charAt(0) || "S"}
        </div>
        <div className="profile-info">
          <h2>{user?.user_metadata?.full_name || "Student"}</h2>
          <p className="profile-email">{user?.email}</p>
          {user?.user_metadata?.wallet_address && (
            <p className="profile-wallet">
              <span className="wallet-label">Wallet:</span>
              <span className="wallet-address">
                {truncateAddress(user.user_metadata.wallet_address)}
              </span>
            </p>
          )}
        </div>
        <div className="profile-badge">
          <FiAward />
          <span>{stats.totalCredentials} Credentials</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <FiAward />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalCredentials}</span>
            <span className="stat-label">Total Credentials</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon verified">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.verifiedCredentials}</span>
            <span className="stat-label">Verified</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FiClock />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.pendingCredentials}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon skills">
            <FiStar />
          </div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalSkills}</span>
            <span className="stat-label">Skills Earned</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/student/credentials" className="action-card">
            <div className="action-icon">
              <FiSearch />
            </div>
            <div className="action-content">
              <h4>View Credentials</h4>
              <p>Browse all your verified certificates</p>
            </div>
            <FiArrowRight className="action-arrow" />
          </Link>
          <Link to="/student/recommendations" className="action-card">
            <div className="action-icon ai">
              <FiStar />
            </div>
            <div className="action-content">
              <h4>AI Insights</h4>
              <p>Get personalized skill recommendations</p>
            </div>
            <FiArrowRight className="action-arrow" />
          </Link>
          <button className="action-card" onClick={() => {}}>
            <div className="action-icon upload">
              <FiUpload />
            </div>
            <div className="action-content">
              <h4>Upload Resume</h4>
              <p>Match credentials to job requirements</p>
            </div>
            <FiArrowRight className="action-arrow" />
          </button>
        </div>
      </div>

      {/* Skills Overview */}
      {stats.skills && stats.skills.length > 0 && (
        <div className="skills-section">
          <h3>Your Skills</h3>
          <div className="skills-tags">
            {stats.skills.slice(0, 12).map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
            {stats.skills.length > 12 && (
              <span className="skill-tag more">
                +{stats.skills.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recent Credentials */}
      <div className="recent-credentials">
        <div className="section-header">
          <h3>Recent Credentials</h3>
          <Link to="/student/credentials" className="view-all">
            View All <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">Loading credentials...</div>
        ) : recentCredentials.length > 0 ? (
          <div className="credentials-grid">
            {recentCredentials.map((credential) => (
              <CredentialCard key={credential.id} credential={credential} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiAward className="empty-icon" />
            <h4>No Credentials Yet</h4>
            <p>
              Your verified credentials will appear here once issued by
              institutions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
