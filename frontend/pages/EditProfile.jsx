import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { updateProfile } from "../services/tripApi.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Username cannot be empty");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
      });

      if (res.data.success) {
        setUser(res.data.user);
        setSuccess("Profile updated successfully!");
        setTimeout(() => {
          navigate(`/profile/${res.data.user.username}`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h2>Edit Travel Profile</h2>
        </div>

        <div className="glass-card animate-slide" style={{ maxWidth: "550px" }}>
          {error && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(231, 76, 60, 0.1)",
              border: "1px solid var(--error)",
              padding: "0.75rem",
              borderRadius: "8px",
              color: "var(--error)",
              fontSize: "0.85rem",
              marginBottom: "1.5rem"
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(46, 204, 113, 0.1)",
              border: "1px solid var(--success)",
              padding: "0.75rem",
              borderRadius: "8px",
              color: "var(--success)",
              fontSize: "0.85rem",
              marginBottom: "1.5rem"
            }}>
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Unique Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. wanderlust_john"
              required
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "-1rem", marginBottom: "1.5rem" }}>
              Only lowercase letters, numbers, and underscores are allowed. Under this username, others can access your public profile.
            </p>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="bio" className="form-label">Travel Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your travel philosophies, favorite places, or packing hacks..."
                className="form-input"
                style={{ height: "120px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "end", gap: "1rem", marginTop: "1.5rem" }}>
              <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Profile"} <Save size={16} />
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EditProfile;
