import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Compass, Sparkles, Shield, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />

      <main className="landing-container">
        <div className="animate-slide" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(212, 175, 55, 0.05)",
            border: "1px solid var(--gold-border)",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            color: "var(--gold-primary)",
            fontSize: "0.85rem",
            fontWeight: "600",
            marginBottom: "1.5rem"
          }}>
            <Sparkles size={14} /> RE-DEFINING LUXURY TRAVEL
          </div>

          <h1 className="landing-title">TripVault</h1>
          <p className="landing-subtitle">
            The ultimate secure travel vault. Plan itineraries, track expenses, store documents,
            and leverage Gemini AI to organize luxury itineraries instantly.
          </p>

          <div className="landing-cta">
            {user ? (
              <Link to="/dashboard" className="btn-gold">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-gold">
                  Explore Vault <Compass size={16} />
                </Link>
                <Link to="/register" className="btn-outline">
                  Join Elite
                </Link>
              </>
            )}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          maxWidth: "900px",
          width: "100%",
          marginTop: "5rem"
        }} className="animate-fade">
          <div className="glass-card">
            <Sparkles size={24} style={{ color: "var(--gold-primary)", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>AI Co-Pilot</h3>
            <p style={{ fontSize: "0.85rem" }}>
              Let Gemini orchestrate your travel schedule, select premium locations, and catalog checklists in seconds.
            </p>
          </div>

          <div className="glass-card">
            <Shield size={24} style={{ color: "var(--gold-primary)", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Document Vault</h3>
            <p style={{ fontSize: "0.85rem" }}>
              Store passports, insurance, and flight tickets securely in the cloud via Cloudinary uploads.
            </p>
          </div>

          <div className="glass-card">
            <Compass size={24} style={{ color: "var(--gold-primary)", marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Live Integrations</h3>
            <p style={{ fontSize: "0.85rem" }}>
              Check real-time weather forecasts, explore Google Places, and convert currency instantly.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
