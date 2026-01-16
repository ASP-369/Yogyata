import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiCpu,
  FiZap,
  FiCheck,
  FiArrowRight,
  FiAward,
} from "react-icons/fi";
import "./LandingPage.css";

const LandingPage = () => {
  const [stats, setStats] = useState({
    credentials: 0,
    institutions: 0,
    verifications: 0,
  });

  // Animated counter effect
  useEffect(() => {
    const targetStats = {
      credentials: 12500,
      institutions: 150,
      verifications: 45000,
    };
    const duration = 2000;
    const steps = 50;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStats({
        credentials: Math.floor(targetStats.credentials * progress),
        institutions: Math.floor(targetStats.institutions * progress),
        verifications: Math.floor(targetStats.verifications * progress),
      });

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FiShield />,
      title: "Tamper-Proof",
      description:
        "Credentials stored on Polygon blockchain ensure authenticity and prevent fraud. Each certificate is immutable and permanently verifiable.",
    },
    {
      icon: <FiCpu />,
      title: "AI-Powered Matching",
      description:
        "Our DistilBERT-based NLP engine extracts skills from job descriptions and matches them with your verified credentials automatically.",
    },
    {
      icon: <FiZap />,
      title: "Instant Verification",
      description:
        "Employers can verify any credential in seconds using QR codes or credential IDs. No more waiting for background checks.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Issue",
      description: "Institutions mint credentials on blockchain",
    },
    {
      number: "02",
      title: "Store",
      description: "Metadata stored securely on IPFS",
    },
    {
      number: "03",
      title: "Share",
      description: "Students share via QR or link",
    },
    {
      number: "04",
      title: "Verify",
      description: "Employers verify instantly",
    },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FiAward />
              <span>Powered by Polygon Blockchain</span>
            </div>
            <h1 className="hero-title">
              Blockchain-Verified
              <span className="gradient-text"> Skills & Credentials</span>
            </h1>
            <p className="hero-description">
              Issue, store, and verify micro-credentials with tamper-proof
              blockchain technology. Empower students, institutions, and
              employers with trust and transparency.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Get Started
                <FiArrowRight />
              </Link>
              <Link to="/verify" className="btn btn-outline btn-lg">
                Verify a Certificate
              </Link>
            </div>
            <div className="hero-trust">
              <FiCheck className="check-icon" />
              <span>No wallet required for verification</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="credential-preview">
              <div className="credential-card">
                <div className="credential-header">
                  <div className="credential-logo">Y</div>
                  <div className="credential-badge">Verified ✓</div>
                </div>
                <h3>Full Stack Development</h3>
                <p>Issued by Tech Academy</p>
                <div className="credential-skills">
                  <span>React</span>
                  <span>Node.js</span>
                  <span>MongoDB</span>
                </div>
                <div className="credential-footer">
                  <div className="qr-placeholder"></div>
                  <div className="hash-preview">0x7f3a...c9b2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-number">
              {stats.credentials.toLocaleString()}+
            </span>
            <span className="stat-label">Credentials Issued</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">{stats.institutions}+</span>
            <span className="stat-label">Partner Institutions</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">
              {stats.verifications.toLocaleString()}+
            </span>
            <span className="stat-label">Verifications Done</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Why Choose Yogyata?</h2>
            <p>Built for the future of education and employment verification</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Simple, transparent, and secure credential management</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="step-connector"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="cta-section">
        <div className="cta-container">
          <h2>Ready to Get Started?</h2>
          <p>
            Join thousands of institutions and students already using Yogyata
            for verified credentials.
          </p>
          <div className="cta-buttons">
            <Link to="/signup?role=student" className="btn btn-white btn-lg">
              I'm a Student
            </Link>
            <Link
              to="/signup?role=institution"
              className="btn btn-outline-white btn-lg"
            >
              I'm an Institution
            </Link>
            <Link
              to="/signup?role=employer"
              className="btn btn-outline-white btn-lg"
            >
              I'm an Employer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
