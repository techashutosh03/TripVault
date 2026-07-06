import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, Compass } from "lucide-react";
import API from "../services/axios.js";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (user) {
        try {
          const res = await API.get("/notifications");
          if (res.data.success) {
            const unread = res.data.notifications.filter((n) => !n.isRead).length;
            setUnreadCount(unread);
          }
        } catch (err) {
          console.error("Failed to load notifications count", err);
        }
      }
    };
    fetchNotificationCount();
    // Poll every 30 seconds for live notifications
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar animate-fade">
      <Link to="/" className="navbar-brand">
        TRIPVAULT
      </Link>

      <div className="navbar-actions">
        {user ? (
          <>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                position: "relative",
                display: "flex",
                alignItems: "center"
              }}
              title="Notifications"
            >
              <Bell size={20} className="hover:text-gold" style={{ color: unreadCount > 0 ? "var(--gold-primary)" : "inherit" }} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "var(--error)",
                  color: "#fff",
                  borderRadius: "50%",
                  padding: "2px 6px",
                  fontSize: "0.65rem",
                  fontWeight: "bold"
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            <div className="profile-widget" onClick={() => navigate("/profile")}>
              <img
                src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
                alt="Profile"
                className="profile-img"
              />
              <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{user.fullName}</span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-gold">
            <Compass size={16} /> Get Started
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
