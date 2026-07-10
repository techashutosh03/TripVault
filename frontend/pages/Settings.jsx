import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { Settings as SettingsIcon, Sliders, Shield, BellRing } from "lucide-react";

const Settings = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <SettingsIcon size={22} style={{ color: "var(--gold-primary)" }} />
          <h2>Vault Configurations</h2>
        </div>

        <div className="glass-card animate-slide" style={{ maxWidth: "600px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
              <Sliders size={20} style={{ color: "var(--gold-primary)", flexShrink: 0, marginTop: "0.2rem" }} />
              <div>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Travel Preferences</h4>
                <p style={{ fontSize: "0.85rem" }}>Configure default currency (INR), traveler count, and units (Metric/Celsius) for automated planning.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "start", borderTop: "1px solid var(--glass-border)", paddingTop: "1.25rem" }}>
              <Shield size={20} style={{ color: "var(--gold-primary)", flexShrink: 0, marginTop: "0.2rem" }} />
              <div>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Privacy & Decryption</h4>
                <p style={{ fontSize: "0.85rem" }}>Enable biometric prompts and configure JWT session expiries for highly sensitive document vaults.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "start", borderTop: "1px solid var(--glass-border)", paddingTop: "1.25rem" }}>
              <BellRing size={20} style={{ color: "var(--gold-primary)", flexShrink: 0, marginTop: "0.2rem" }} />
              <div>
                <h4 style={{ fontSize: "0.95rem", marginBottom: "0.25rem" }}>Automated Reminders</h4>
                <p style={{ fontSize: "0.85rem" }}>Customize trigger periods for flight checks, hotel check-in notifications, and visa safety prompts.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
