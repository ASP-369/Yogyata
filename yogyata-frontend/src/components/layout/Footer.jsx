import React from "react";
import "./Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "About Yogyata", href: "/about" },
        { label: "How it Works", href: "/how-it-works" },
        { label: "Pricing", href: "/pricing" },
        { label: "Success Stories", href: "/success-stories" },
      ],
    },
    {
      title: "Features",
      links: [
        { label: "Credential Verification", href: "/features/verification" },
        { label: "Blockchain Security", href: "/features/blockchain" },
        { label: "AI Job Matching", href: "/features/ai-matching" },
        { label: "Analytics Dashboard", href: "/features/analytics" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/api-docs" },
        { label: "Help Center", href: "/help" },
        { label: "Blog", href: "/blog" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/company/about" },
        { label: "Careers", href: "/company/careers" },
        { label: "Contact", href: "/company/contact" },
        { label: "Privacy Policy", href: "/privacy" },
      ],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>Yogyata</span>
            </div>
            <p className="footer-description">
              Empowering careers through blockchain-verified credentials.
              Connect your skills with opportunities in the decentralized future
              of work.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="LinkedIn">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" aria-label="Discord">
                <i className="fab fa-discord"></i>
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-links">
            {footerSections.map((section) => (
              <div key={section.title} className="footer-section">
                <h3 className="footer-section-title">{section.title}</h3>
                <ul className="footer-section-links">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div className="footer-newsletter">
          <h3>Stay Updated</h3>
          <p>
            Get the latest updates on blockchain credentials and job
            opportunities.
          </p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <button className="newsletter-button">
              <i className="fas fa-paper-plane"></i>
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Yogyata. All rights reserved.
            </p>
            <div className="footer-bottom-links">
              <a href="/terms">Terms of Service</a>
              <a href="/privacy">Privacy Policy</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
