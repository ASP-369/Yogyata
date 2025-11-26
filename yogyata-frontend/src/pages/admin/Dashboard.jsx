import React, { useState } from "react";
import Button from "../../components/common/Button";
import "./Dashboard.css";

const AdminDashboard = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  const stats = [
    {
      title: "Total Users",
      value: "12,485",
      change: "+8.2%",
      changeType: "increase",
      icon: "fas fa-users",
    },
    {
      title: "Verified Credentials",
      value: "45,231",
      change: "+12.5%",
      changeType: "increase",
      icon: "fas fa-certificate",
    },
    {
      title: "Active Verifications",
      value: "1,247",
      change: "+5.3%",
      changeType: "increase",
      icon: "fas fa-shield-check",
    },
    {
      title: "System Uptime",
      value: "99.98%",
      change: "+0.01%",
      changeType: "increase",
      icon: "fas fa-server",
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "user_registration",
      description: "New user registered: john.doe@email.com",
      timestamp: "2 minutes ago",
      icon: "fas fa-user-plus",
    },
    {
      id: 2,
      type: "credential_verification",
      description: "Credential verified: React Developer Certification",
      timestamp: "5 minutes ago",
      icon: "fas fa-check-circle",
    },
    {
      id: 3,
      type: "system_alert",
      description: "High verification volume detected",
      timestamp: "15 minutes ago",
      icon: "fas fa-exclamation-triangle",
    },
  ];

  const topInstitutions = [
    { name: "Meta", credentials: 2845, growth: "+15%" },
    { name: "Google", credentials: 2156, growth: "+8%" },
    { name: "Amazon", credentials: 1923, growth: "+12%" },
    { name: "Microsoft", credentials: 1756, growth: "+6%" },
    { name: "Stanford University", credentials: 1634, growth: "+18%" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <p>Manage users, credentials, and system operations</p>
          </div>
          <div className="header-actions">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="time-range-select"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button variant="primary">
              <i className="fas fa-download"></i>
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">
                <i className={stat.icon}></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-title">{stat.title}</div>
                <div className={`stat-change stat-change--${stat.changeType}`}>
                  <i
                    className={`fas ${
                      stat.changeType === "increase"
                        ? "fa-arrow-up"
                        : "fa-arrow-down"
                    }`}
                  ></i>
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Chart Section */}
          <div className="chart-section">
            <div className="section-header">
              <h3>Verification Trends</h3>
              <div className="chart-controls">
                <button className="chart-btn active">Daily</button>
                <button className="chart-btn">Weekly</button>
                <button className="chart-btn">Monthly</button>
              </div>
            </div>
            <div className="chart-placeholder">
              <i className="fas fa-chart-line"></i>
              <p>
                Chart visualization would be implemented here using a library
                like Chart.js or D3.js
              </p>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="activities-section">
            <div className="section-header">
              <h3>Recent Activities</h3>
              <Button variant="outline" size="small">
                View All
              </Button>
            </div>
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <i className={activity.icon}></i>
                  </div>
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Institutions */}
          <div className="institutions-section">
            <div className="section-header">
              <h3>Top Issuing Institutions</h3>
            </div>
            <div className="institutions-list">
              {topInstitutions.map((institution, index) => (
                <div key={index} className="institution-item">
                  <div className="institution-rank">#{index + 1}</div>
                  <div className="institution-info">
                    <div className="institution-name">{institution.name}</div>
                    <div className="institution-stats">
                      {institution.credentials} credentials
                    </div>
                  </div>
                  <div className="institution-growth">
                    <span className="growth-indicator">
                      <i className="fas fa-arrow-up"></i>
                      {institution.growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="system-health-section">
            <div className="section-header">
              <h3>System Health</h3>
            </div>
            <div className="health-metrics">
              <div className="health-item">
                <div className="health-label">Blockchain Sync</div>
                <div className="health-status status--good">
                  <i className="fas fa-check-circle"></i>
                  Synced
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Database</div>
                <div className="health-status status--good">
                  <i className="fas fa-check-circle"></i>
                  Healthy
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">API Gateway</div>
                <div className="health-status status--warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  High Load
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Storage</div>
                <div className="health-status status--good">
                  <i className="fas fa-check-circle"></i>
                  85% Free
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-card">
              <i className="fas fa-users"></i>
              <span>Manage Users</span>
            </button>
            <button className="action-card">
              <i className="fas fa-certificate"></i>
              <span>Review Credentials</span>
            </button>
            <button className="action-card">
              <i className="fas fa-cog"></i>
              <span>System Settings</span>
            </button>
            <button className="action-card">
              <i className="fas fa-backup"></i>
              <span>Backup Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
