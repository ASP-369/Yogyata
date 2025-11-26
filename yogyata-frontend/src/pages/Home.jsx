import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const features = [
    {
      icon: "fas fa-shield-alt",
      title: "Blockchain Security",
      description:
        "Your credentials are secured on the blockchain, ensuring they cannot be forged or tampered with.",
    },
    {
      icon: "fas fa-robot",
      title: "AI-Powered Matching",
      description:
        "Our AI analyzes your skills and matches you with the perfect job opportunities.",
    },
    {
      icon: "fas fa-search",
      title: "Smart Verification",
      description:
        "Instantly verify any credential with our blockchain-powered verification system.",
    },
    {
      icon: "fas fa-chart-line",
      title: "Career Analytics",
      description:
        "Track your career growth with detailed analytics and insights.",
    },
  ];

  const stats = [
    { number: "50K+", label: "Verified Credentials" },
    { number: "10K+", label: "Active Users" },
    { number: "500+", label: "Partner Companies" },
    { number: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Yogyata</h1>
            <h2 className="hero-subtitle">
              (Empowering Verified Competencies)
            </h2>
            <p className="hero-description">
              Discover and explore amazing job opportunities that match your
              verified skills and competencies. Join thousands of professionals
              building their careers with blockchain-verified credentials.
            </p>
            <div className="hero-actions">
              <Link to="/jobs" className="btn btn--primary btn--large">
                <i className="fas fa-search"></i>
                Explore Jobs
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="profile-cards">
              <div className="profile-card profile-card--designer">
                <div className="profile-avatar">
                  <img
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=60&h=60&fit=crop&crop=face"
                    alt="UI/UX Designer"
                  />
                </div>
                <div className="profile-info">
                  <h4>UI UX Designer</h4>
                  <p>$70k - $85k</p>
                </div>
                <div className="profile-badge">+</div>
              </div>
              <div className="profile-card profile-card--developer">
                <div className="profile-avatar">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
                    alt="Java Developer"
                  />
                </div>
                <div className="profile-info">
                  <h4>Java Developer</h4>
                  <p>$80k - $95k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="job-categories">
        <div className="container">
          <h2 className="section-title">
            Explore more <span className="highlight">jobs</span>
          </h2>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Job, skills, company..."
              className="search-input"
            />
            <select className="location-select">
              <option>Location</option>
              <option>Remote</option>
              <option>New York</option>
              <option>San Francisco</option>
            </select>
            <button className="search-btn">Search</button>
          </div>
          <div className="categories-grid">
            <div className="category-item">
              <div className="category-icon category-icon--finance">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Finance</h3>
              <p>817 Jobs</p>
            </div>
            <div className="category-item">
              <div className="category-icon category-icon--education">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3>Education</h3>
              <p>516 Jobs</p>
            </div>
            <div className="category-item">
              <div className="category-icon category-icon--it">
                <i className="fas fa-laptop-code"></i>
              </div>
              <h3>IT</h3>
              <p>2741 Jobs</p>
            </div>
            <div className="category-item">
              <div className="category-icon category-icon--marketing">
                <i className="fas fa-bullhorn"></i>
              </div>
              <h3>Marketing</h3>
              <p>413 Jobs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Jobs Section */}
      <section className="latest-jobs">
        <div className="container">
          <h2 className="section-title">
            Latest <span className="highlight">jobs</span>
          </h2>
          <p className="section-subtitle">
            Blockchain-verified opportunities for you
          </p>
          <div className="jobs-grid">
            <div className="job-card">
              <div className="job-header">
                <div className="company-logo">
                  <i className="fab fa-google"></i>
                </div>
                <div className="job-info">
                  <h3>UI / UX Designer</h3>
                  <p>$70k - $85k</p>
                </div>
              </div>
              <div className="job-details">
                <span className="job-location">Sunnyvale, CA</span>
                <span className="job-type">Full-time</span>
                <span className="job-experience">2-3 years</span>
              </div>
            </div>
            <div className="job-card">
              <div className="job-header">
                <div className="company-logo company-logo--orange">
                  <i className="fab fa-amazon"></i>
                </div>
                <div className="job-info">
                  <h3>C# Developer</h3>
                  <p>$80k - $95k</p>
                </div>
              </div>
              <div className="job-details">
                <span className="job-location">Sunnyvale, CA</span>
                <span className="job-type">Full-time</span>
                <span className="job-experience">3-5 years</span>
              </div>
            </div>
            <div className="job-card">
              <div className="job-header">
                <div className="company-logo company-logo--green">
                  <i className="fab fa-microsoft"></i>
                </div>
                <div className="job-info">
                  <h3>ReactJS Developer</h3>
                  <p>$75k - $90k</p>
                </div>
              </div>
              <div className="job-details">
                <span className="job-location">Remote, US</span>
                <span className="job-type">Contract</span>
                <span className="job-experience">2-4 years</span>
              </div>
            </div>
            <div className="job-card">
              <div className="job-header">
                <div className="company-logo company-logo--blue">
                  <i className="fab fa-facebook"></i>
                </div>
                <div className="job-info">
                  <h3>UI / UX Designer</h3>
                  <p>$85k - $110k</p>
                </div>
              </div>
              <div className="job-details">
                <span className="job-location">Santa Ana, CA</span>
                <span className="job-type">Full-time</span>
                <span className="job-experience">3-5 years</span>
              </div>
            </div>
            <div className="job-card">
              <div className="job-header">
                <div className="company-logo company-logo--red">
                  <i className="fab fa-netflix"></i>
                </div>
                <div className="job-info">
                  <h3>IT Director</h3>
                  <p>$120k - $150k</p>
                </div>
              </div>
              <div className="job-details">
                <span className="job-location">Austin, TX</span>
                <span className="job-type">Full-time</span>
                <span className="job-experience">7+ years</span>
              </div>
            </div>
            <div className="job-card">
              <div className="job-header">
                <div className="company-logo company-logo--purple">
                  <i className="fab fa-spotify"></i>
                </div>
                <div className="job-info">
                  <h3>Product Manager</h3>
                  <p>$100k - $130k</p>
                </div>
              </div>
              <div className="job-details">
                <span className="job-location">Berlin, DE</span>
                <span className="job-type">Full-time</span>
                <span className="job-experience">5+ years</span>
              </div>
            </div>
          </div>
          <div className="jobs-cta">
            <Link to="/jobs" className="btn btn--outline">
              See more
            </Link>
          </div>
        </div>
      </section>

      {/* Top Companies Section */}
      <section className="top-companies">
        <div className="container">
          <h2 className="section-title">
            Top <span className="highlight">IT companies</span>
          </h2>
          <p className="section-subtitle">
            Blockchain-verified employers for you
          </p>
          <div className="companies-grid">
            <div className="company-card">
              <div className="company-logo-large">
                <i className="fas fa-chart-bar"></i>
              </div>
              <h3>ALQ</h3>
              <p>15 Jobs • New York</p>
            </div>
            <div className="company-card">
              <div className="company-logo-large company-logo--orange">
                <i className="fas fa-mountain"></i>
              </div>
              <h3>ESSE LOREM</h3>
              <p>28 Jobs • New York</p>
            </div>
            <div className="company-card">
              <div className="company-logo-large company-logo--blue">
                <i className="fas fa-globe"></i>
              </div>
              <h3>LANDORUM</h3>
              <p>17 Jobs • New York</p>
            </div>
            <div className="company-card">
              <div className="company-logo-large company-logo--purple">
                <i className="fas fa-rocket"></i>
              </div>
              <h3>DESIGNIT</h3>
              <p>31 Jobs • New York</p>
            </div>
          </div>
          <div className="companies-cta">
            <button className="btn btn--outline">View More</button>
          </div>
        </div>
      </section>

      {/* Profile Building CTA */}
      <section className="profile-cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Build a great profile</h2>
              <p>
                Create compelling profiles and portfolios to showcase your
                blockchain-verified competencies. Stand out to top employers
                with verified skills.
              </p>
              <Link to="/profile" className="btn btn--primary">
                Start now
              </Link>
            </div>
            <div className="cta-visual">
              <div className="profile-preview">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop"
                  alt="Professional profile"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Advice Section */}
      <section className="career-advice">
        <div className="container">
          <h2 className="section-title">
            Career advices from <span className="highlight">HR Insiders</span>
          </h2>
          <div className="advice-grid">
            <div className="advice-card">
              <img
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=200&fit=crop"
                alt="Career advice"
              />
              <div className="advice-content">
                <span className="advice-category">DEVELOPMENT</span>
                <h3>Aliqua incunt Tempor Lorem Occaecat Volup</h3>
                <p>May 31, 2019</p>
                <span className="read-time">8 min read</span>
              </div>
            </div>
            <div className="advice-card">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
                alt="Career advice"
              />
              <div className="advice-content">
                <span className="advice-category">CONSULTING</span>
                <h3>Commodo Deserunt Ipsum Occaecat Qui</h3>
                <p>May 31, 2019</p>
                <span className="read-time">8 min read</span>
              </div>
            </div>
            <div className="advice-card">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop"
                alt="Career advice"
              />
              <div className="advice-content">
                <span className="advice-category">DEVELOPMENT</span>
                <h3>Eu labore ex nostrud fugiat sit non nulla</h3>
                <p>May 31, 2019</p>
                <span className="read-time">8 min read</span>
              </div>
            </div>
          </div>
          <div className="advice-cta">
            <button className="btn btn--primary">View more articles</button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Yogyata?</h2>
            <p>
              Discover the benefits of blockchain-powered credential
              verification
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple steps to secure and verify your credentials</p>
          </div>
          <div className="steps-grid">
            <div className="step-item">
              <div className="step-number">1</div>
              <h3>Upload Credential</h3>
              <p>
                Upload your certificates, degrees, or licenses to our platform
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <h3>Blockchain Verification</h3>
              <p>
                Our system verifies and stores your credential on the blockchain
              </p>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <h3>Share & Apply</h3>
              <p>
                Share verified credentials with employers and apply for jobs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Transform Your Career?</h2>
            <p>
              Join thousands of professionals who trust Yogyata with their
              credentials
            </p>
            <div className="cta-actions">
              <Link to="/profile" className="btn btn--primary btn--large">
                Start Your Journey
              </Link>
              <Link to="/about" className="btn btn--outline btn--large">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
