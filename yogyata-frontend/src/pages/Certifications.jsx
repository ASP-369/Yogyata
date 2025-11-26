import React from "react";
import "./Certifications.css";

const Certifications = () => {
  const certifications = [
    {
      id: 1,
      title: "React Developer Professional",
      issuer: "Meta",
      level: "Professional",
      duration: "6-8 weeks",
      skills: ["React.js", "JSX", "Hooks", "State Management"],
      verified: true,
      students: "15,000+",
      rating: 4.8,
      price: "Free",
    },
    {
      id: 2,
      title: "Full Stack Web Development",
      issuer: "Google",
      level: "Intermediate",
      duration: "12-16 weeks",
      skills: ["HTML", "CSS", "JavaScript", "Node.js", "Database"],
      verified: true,
      students: "25,000+",
      rating: 4.9,
      price: "$299",
    },
    {
      id: 3,
      title: "Cloud Computing Fundamentals",
      issuer: "AWS",
      level: "Beginner",
      duration: "8-10 weeks",
      skills: ["AWS", "Cloud Architecture", "DevOps", "Security"],
      verified: true,
      students: "12,000+",
      rating: 4.7,
      price: "$199",
    },
    {
      id: 4,
      title: "Data Science & Analytics",
      issuer: "IBM",
      level: "Advanced",
      duration: "16-20 weeks",
      skills: ["Python", "Machine Learning", "SQL", "Tableau"],
      verified: true,
      students: "8,000+",
      rating: 4.8,
      price: "$399",
    },
  ];

  const categories = [
    { name: "Web Development", count: 45, icon: "fas fa-code" },
    { name: "Data Science", count: 32, icon: "fas fa-chart-bar" },
    { name: "Cloud Computing", count: 28, icon: "fas fa-cloud" },
    { name: "Mobile Development", count: 24, icon: "fas fa-mobile-alt" },
    { name: "AI & Machine Learning", count: 18, icon: "fas fa-robot" },
    { name: "Cybersecurity", count: 15, icon: "fas fa-shield-alt" },
  ];

  return (
    <div className="certifications">
      <div className="container">
        <div className="page-header">
          <h1>Blockchain-Verified Certifications</h1>
          <p>Earn credentials that employers trust and verify instantly</p>
        </div>

        <div className="certifications-hero">
          <div className="hero-content">
            <h2>Why Choose Blockchain-Verified Certifications?</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-shield-check"></i>
                </div>
                <h3>Tamper-Proof</h3>
                <p>
                  Certificates secured on blockchain cannot be forged or altered
                </p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h3>Global Recognition</h3>
                <p>Universally verifiable credentials accepted worldwide</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-zap"></i>
                </div>
                <h3>Instant Verification</h3>
                <p>Employers can verify your credentials in seconds</p>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <h3>Career Boost</h3>
                <p>Stand out with verified competencies and skills</p>
              </div>
            </div>
          </div>
        </div>

        <div className="categories-section">
          <h2>Browse by Category</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <div className="category-icon">
                  <i className={category.icon}></i>
                </div>
                <h3>{category.name}</h3>
                <p>{category.count} certifications</p>
              </div>
            ))}
          </div>
        </div>

        <div className="featured-certifications">
          <h2>Featured Certifications</h2>
          <div className="certifications-grid">
            {certifications.map((cert) => (
              <div key={cert.id} className="certification-card">
                <div className="cert-header">
                  <div className="cert-issuer">{cert.issuer}</div>
                  {cert.verified && (
                    <div className="verified-badge">
                      <i className="fas fa-check-circle"></i>
                      Blockchain Verified
                    </div>
                  )}
                </div>

                <h3>{cert.title}</h3>

                <div className="cert-details">
                  <div className="detail-row">
                    <span className="label">Level:</span>
                    <span className="value">{cert.level}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">{cert.duration}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Students:</span>
                    <span className="value">{cert.students}</span>
                  </div>
                </div>

                <div className="cert-skills">
                  <span className="skills-label">Skills you'll learn:</span>
                  <div className="skills-list">
                    {cert.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="cert-footer">
                  <div className="rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-value">{cert.rating}</span>
                  </div>
                  <div className="price">{cert.price}</div>
                </div>

                <div className="cert-actions">
                  <button className="btn btn--outline">Learn More</button>
                  <button className="btn btn--primary">Enroll Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="verification-info">
          <div className="verification-content">
            <h2>How Blockchain Verification Works</h2>
            <div className="steps-grid">
              <div className="step-item">
                <div className="step-number">1</div>
                <h4>Complete Course</h4>
                <p>Finish all modules and pass assessments</p>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <h4>Blockchain Recording</h4>
                <p>Certificate is recorded on immutable blockchain</p>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <h4>Instant Verification</h4>
                <p>Share verifiable credentials with employers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certifications;
