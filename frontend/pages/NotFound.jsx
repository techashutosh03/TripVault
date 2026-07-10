import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Footer from "../components/Footer.jsx";

const NotFound = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main className="landing-container">
        <h1 className="landing-title" style={{ fontSize: "6rem", color: "var(--gold-primary)" }}>404</h1>
        <h2 style={{ textTransform: "none", borderLeft: "none", paddingLeft: 0, marginBottom: "1rem" }}>
          Vault Section Uncharted
        </h2>
        <p className="landing-subtitle" style={{ maxWidth: "450px" }}>
          The coordinates you requested do not exist in this travel planner database. Let's head back to safety.
        </p>
        <Link to="/dashboard" className="btn-gold">
          <Compass size={16} /> Return to Safety
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
