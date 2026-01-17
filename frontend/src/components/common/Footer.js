import React from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">Y</span>
              <span className="logo-text">Yogyata</span>
            </div>
            <p className="footer-desc">
              Blockchain-verified micro-credentials for a trustworthy future.
              Empowering students, institutions, and employers with tamper-proof
              verification.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="GitHub">
                <FiGithub />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
              <a href="#" className="social-link" aria-label="Email">
                <FiMail />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Platform</h4>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/verify">Verify Credential</Link>
              </li>
              <li>
                <Link to="/signup">Get Started</Link>
              </li>
              <li>
                <a href="#features">Features</a>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Resources</h4>
            <ul>
              <li>
                <a href="#">Documentation</a>
              </li>
              <li>
                <a href="#">API Reference</a>
              </li>
              <li>
                <a href="#">Smart Contracts</a>
              </li>
              <li>
                <a href="#">EtherScan Explorer</a>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Cookie Policy</a>
              </li>
              <li>
                <a href="#">Contact Us</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Yogyata. All rights reserved.</p>
          <p className="footer-tech">
            Powered by <span>Sepolia</span> • <span>IPFS</span> •{" "}
            <span>React</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
