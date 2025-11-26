import React from "react";
import "./Universities.css";

const Universities = () => {
  const universities = [
    {
      id: 1,
      name: "Stanford University",
      logo: "https://images.unsplash.com/photo-1562774053-701939374585?w=100&h=100&fit=crop",
      location: "Stanford, CA",
      ranking: "#2 Global",
      students: "17,000+",
      programs: 65,
      partnerships: 12,
      verification: "Blockchain Verified",
      rating: 4.9,
      type: "Private Research",
    },
    {
      id: 2,
      name: "MIT",
      logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100&h=100&fit=crop",
      location: "Cambridge, MA",
      ranking: "#1 Engineering",
      students: "11,500+",
      programs: 58,
      partnerships: 18,
      verification: "Blockchain Verified",
      rating: 4.9,
      type: "Private Research",
    },
    {
      id: 3,
      name: "Harvard University",
      logo: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=100&h=100&fit=crop",
      location: "Cambridge, MA",
      ranking: "#1 Global",
      students: "23,000+",
      programs: 85,
      partnerships: 25,
      verification: "Blockchain Verified",
      rating: 4.8,
      type: "Private Research",
    },
    {
      id: 4,
      name: "UC Berkeley",
      logo: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=100&h=100&fit=crop",
      location: "Berkeley, CA",
      ranking: "#4 Public",
      students: "45,000+",
      programs: 120,
      partnerships: 15,
      verification: "Blockchain Verified",
      rating: 4.7,
      type: "Public Research",
    },
    {
      id: 5,
      name: "Carnegie Mellon",
      logo: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&h=100&fit=crop",
      location: "Pittsburgh, PA",
      ranking: "#1 Computer Science",
      students: "14,500+",
      programs: 75,
      partnerships: 20,
      verification: "Blockchain Verified",
      rating: 4.8,
      type: "Private Research",
    },
    {
      id: 6,
      name: "Oxford University",
      logo: "https://images.unsplash.com/photo-1481026469463-66327c86e544?w=100&h=100&fit=crop",
      location: "Oxford, UK",
      ranking: "#1 UK",
      students: "24,000+",
      programs: 95,
      partnerships: 30,
      verification: "Blockchain Verified",
      rating: 4.9,
      type: "Public Research",
    },
  ];

  const categories = [
    {
      name: "Computer Science",
      count: 125,
      icon: "fas fa-laptop-code",
      color: "blue",
    },
    { name: "Engineering", count: 98, icon: "fas fa-cogs", color: "orange" },
    { name: "Business", count: 87, icon: "fas fa-chart-line", color: "green" },
    { name: "Medicine", count: 72, icon: "fas fa-stethoscope", color: "red" },
    {
      name: "Data Science",
      count: 65,
      icon: "fas fa-database",
      color: "purple",
    },
    {
      name: "Arts & Design",
      count: 45,
      icon: "fas fa-paint-brush",
      color: "pink",
    },
  ];

  return (
    <div className="universities">
      <div className="container">
        <div className="page-header">
          <h1>Partner Universities</h1>
          <p>
            Leading institutions offering blockchain-verified credentials and
            certificates
          </p>
        </div>

        <div className="universities-hero">
          <div className="hero-content">
            <h2>Why Choose Verified University Programs?</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3>Accredited Programs</h3>
                <p>
                  All programs from top-ranked, globally recognized institutions
                </p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-blockchain"></i>
                </div>
                <h3>Blockchain Verified</h3>
                <p>
                  Tamper-proof certificates recorded on immutable blockchain
                </p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-globe-americas"></i>
                </div>
                <h3>Global Recognition</h3>
                <p>Credentials accepted by employers worldwide</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3>Industry Partnerships</h3>
                <p>
                  Direct connections with leading companies for career
                  opportunities
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search universities, programs..."
              className="search-input"
            />
            <select className="filter-select">
              <option>All Locations</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Europe</option>
            </select>
            <select className="filter-select">
              <option>All Types</option>
              <option>Public Research</option>
              <option>Private Research</option>
              <option>Liberal Arts</option>
            </select>
            <button className="search-btn">Search</button>
          </div>
        </div>

        <div className="program-categories">
          <h2>Browse Programs by Field</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div
                key={index}
                className={`category-card category-${category.color}`}
              >
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>
                <h3>{category.name}</h3>
                <p>{category.count} programs</p>
              </div>
            ))}
          </div>
        </div>

        <div className="universities-grid">
          <h2>Featured Universities</h2>
          <div className="grid-container">
            {universities.map((university) => (
              <div key={university.id} className="university-card">
                <div className="university-header">
                  <div className="university-logo">
                    <img src={university.logo} alt={university.name} />
                  </div>
                  <div className="verification-badge">
                    <i className="fas fa-check-circle"></i>
                    {university.verification}
                  </div>
                </div>

                <div className="university-info">
                  <h3>{university.name}</h3>
                  <p className="university-type">{university.type}</p>

                  <div className="university-stats">
                    <div className="stat-row">
                      <span className="label">Location:</span>
                      <span className="value">{university.location}</span>
                    </div>
                    <div className="stat-row">
                      <span className="label">Ranking:</span>
                      <span className="value">{university.ranking}</span>
                    </div>
                    <div className="stat-row">
                      <span className="label">Students:</span>
                      <span className="value">{university.students}</span>
                    </div>
                    <div className="stat-row">
                      <span className="label">Programs:</span>
                      <span className="value">{university.programs}</span>
                    </div>
                  </div>

                  <div className="university-metrics">
                    <div className="metric">
                      <span className="metric-value">
                        {university.partnerships}
                      </span>
                      <span className="metric-label">Industry Partners</span>
                    </div>
                    <div className="rating">
                      <span className="stars">★★★★★</span>
                      <span className="rating-value">{university.rating}</span>
                    </div>
                  </div>

                  <div className="university-actions">
                    <button className="btn btn--outline">View Programs</button>
                    <button className="btn btn--primary">Learn More</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="partnership-info">
          <div className="partnership-content">
            <h2>University Partnership Benefits</h2>
            <div className="partnership-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-certificate"></i>
                </div>
                <div className="feature-text">
                  <h4>Verified Credentials</h4>
                  <p>
                    All degrees and certificates are blockchain-verified for
                    authenticity
                  </p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <div className="feature-text">
                  <h4>Industry Connections</h4>
                  <p>Direct pathways to employment with partner companies</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <i className="fas fa-rocket"></i>
                </div>
                <div className="feature-text">
                  <h4>Career Support</h4>
                  <p>
                    Comprehensive career services and job placement assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Universities;
