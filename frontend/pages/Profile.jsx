import React from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <User size={22} style={{ color: "var(--gold-primary)" }} />
          <h2>My Profile Vault</h2>
        </div>

        {user && (
          <div className="glass-card animate-slide" style={{ maxWidth: "500px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "3rem 2rem" }}>
            <img
              src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt="Profile"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                border: "2px solid var(--gold-primary)",
                objectFit: "cover",
                marginBottom: "1.5rem"
              }}
            />

            <h3 style={{ fontSize: "1.3rem", textTransform: "none", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              {user.fullName}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
              {user.email}
            </p>

            <div style={{ width: "100%", borderTop: "1px solid var(--glass-border)", paddingTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Vault Privilege</span>
                <span style={{ fontWeight: "700", color: "var(--gold-primary)" }}>ELITE TRAVELER</span>
              </div>
              <div style={{ display: "flex", justifyContent: "between", fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Account Status</span>
                <span style={{ fontWeight: "700", color: "var(--success)" }}>ACTIVE</span>
              </div>
            </div>

            <Button onClick={handleLogout} variant="outline" style={{ marginTop: "2.5rem", width: "100%", justifyContent: "center", color: "var(--error)", borderColor: "rgba(231, 76, 60, 0.3)" }}>
              <LogOut size={16} /> Disconnect Session
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
