import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, Compass, Sun, Moon, User, Briefcase, LayoutDashboard, Home as HomeIcon } from "lucide-react";
import API from "../services/axios.js";
import { toast } from "react-toastify";

const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem("tripvault_theme") || "dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tripvault_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

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
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out from TripVault.");
    navigate("/login");
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="navbar animate-fade">
      {/* Brand logo */}
      <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
        TRIPVAULT
      </Link>

      {/* Primary navigation links */}
      <nav className={`navbar-nav ${menuOpen ? "open" : ""}`}>
        <NavLink
          to="/"
          className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          <HomeIcon size={14} /> Home
        </NavLink>

        {user ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <LayoutDashboard size={14} /> Dashboard
            </NavLink>
            <NavLink
              to="/trips"
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <Briefcase size={14} /> My Trips
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              <User size={14} /> Profile
            </NavLink>
            <span
              className="navbar-link mobile-only-link"
              onClick={handleLogout}
              style={{ cursor: "pointer", display: "none" }}
            >
              <LogOut size={14} /> Logout
            </span>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}
              onClick={() => setMenuOpen(false)}
            >
              Register
            </NavLink>
          </>
        )}
      </nav>

      {/* Action buttons (Theme, Notifications, Profile, Logout) */}
      <div className="navbar-actions">
        <button
          onClick={toggleTheme}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center"
          }}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user && (
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
              <span className="profile-name-desktop" style={{ fontSize: "0.85rem", fontWeight: "600" }}>{user.fullName}</span>
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
              className="logout-btn-desktop"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        )}

        {/* Mobile menu toggle (hamburger) */}
        <button
          className={`hamburger-btn ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
