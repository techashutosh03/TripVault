import React from "react";
import { Link } from "react-router-dom";
import { Github, Heart, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-grid">
        {/* Col 1: Logo & About */}
        <div className="footer-col">
          <Link to="/" className="footer-logo">TRIPVAULT</Link>
          <p className="footer-desc">
            Organize elite travel itineraries, track your budget, vault critical documents, and plan adventures instantly using Gemini AI.
          </p>
        </div>

        {/* Col 2: Quick Links */}
        <div className="footer-col">
          <h4>Quick Navigation</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/trips">My Trips</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>

        {/* Col 3: Github & Contact */}
        <div className="footer-col">
          <h4>Creator Portal</h4>
          <p className="footer-desc" style={{ marginBottom: "0.25rem" }}>
            Developed by <strong>Ashutosh Gautam</strong> as part of the production-ready internship portfolio.
          </p>
          <div className="footer-socials">
            <a 
              href="https://github.com/ashutoshgautam" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-outline"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.4rem 0.8rem",
                fontSize: "0.8rem",
                borderRadius: "6px"
              }}
            >
              <Github size={14} /> GitHub Profile <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} TripVault. All Rights Reserved.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          Crafted with <Heart size={12} style={{ color: "var(--error)", fill: "var(--error)" }} /> for elite travelers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
