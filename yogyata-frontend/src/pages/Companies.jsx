import React from "react";
import "./Companies.css";

const Companies = () => {
  const companies = [
    {
      name: "TechCorp Inc.",
      logo: "fas fa-laptop-code",
      industry: "Technology",
      employees: "1000-5000",
      location: "San Francisco, CA",
      openPositions: 15,
      color: "blue",
    },
    {
      name: "DataSoft Solutions",
      logo: "fas fa-database",
      industry: "Software Development",
      employees: "500-1000",
      location: "Austin, TX",
      openPositions: 8,
      color: "green",
    },
    {
      name: "CloudTech Systems",
      logo: "fas fa-cloud",
      industry: "Cloud Computing",
      employees: "100-500",
      location: "Seattle, WA",
      openPositions: 12,
      color: "purple",
    },
    {
      name: "AI Innovations Ltd",
      logo: "fas fa-robot",
      industry: "Artificial Intelligence",
      employees: "50-100",
      location: "Boston, MA",
      openPositions: 6,
      color: "orange",
    },
  ];

  return (
    <div className="companies">
      <div className="container">
        <div className="page-header">
          <h1>Top Companies</h1>
          <p>
            Discover blockchain-verified employers and amazing opportunities
          </p>
        </div>

        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search companies..."
              className="search-input"
            />
            <select className="filter-select">
              <option>All Industries</option>
              <option>Technology</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Education</option>
            </select>
            <select className="filter-select">
              <option>Company Size</option>
              <option>1-50 employees</option>
              <option>51-200 employees</option>
              <option>201-1000 employees</option>
              <option>1000+ employees</option>
            </select>
            <button className="search-btn">Search</button>
          </div>
        </div>

        <div className="companies-grid">
          {companies.map((company, index) => (
            <div key={index} className="company-card">
              <div className="company-header">
                <div className={`company-logo company-logo--${company.color}`}>
                  <i className={company.logo}></i>
                </div>
                <div className="company-info">
                  <h3>{company.name}</h3>
                  <p>{company.industry}</p>
                </div>
              </div>

              <div className="company-details">
                <div className="detail-item">
                  <i className="fas fa-users"></i>
                  <span>{company.employees} employees</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{company.location}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-briefcase"></i>
                  <span>{company.openPositions} open positions</span>
                </div>
              </div>

              <div className="company-actions">
                <button className="btn btn--outline">View Profile</button>
                <button className="btn btn--primary">View Jobs</button>
              </div>
            </div>
          ))}
        </div>

        <div className="featured-companies">
          <h2>Featured Companies</h2>
          <div className="featured-grid">
            <div className="featured-company">
              <div className="featured-logo">
                <i className="fab fa-google"></i>
              </div>
              <div className="featured-info">
                <h4>Google</h4>
                <p>25 open positions</p>
              </div>
            </div>
            <div className="featured-company">
              <div className="featured-logo featured-logo--orange">
                <i className="fab fa-amazon"></i>
              </div>
              <div className="featured-info">
                <h4>Amazon</h4>
                <p>18 open positions</p>
              </div>
            </div>
            <div className="featured-company">
              <div className="featured-logo featured-logo--blue">
                <i className="fab fa-microsoft"></i>
              </div>
              <div className="featured-info">
                <h4>Microsoft</h4>
                <p>32 open positions</p>
              </div>
            </div>
            <div className="featured-company">
              <div className="featured-logo featured-logo--red">
                <i className="fab fa-netflix"></i>
              </div>
              <div className="featured-info">
                <h4>Netflix</h4>
                <p>12 open positions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Companies;
