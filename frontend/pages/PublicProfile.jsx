import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Loader from "../components/Loader.jsx";
import { getPublicProfile } from "../services/tripApi.js";
import { Calendar, MapPin, Star, User, Heart, MessageSquare, Send } from "lucide-react";
import API from "../services/axios.js";
import { toast } from "react-toastify";

const PublicProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const handleLikeTrip = async (tripId) => {
    try {
      const res = await API.post(`/trips/${tripId}/like`);
      if (res.data.success) {
        toast.success(res.data.message);
        // Update local state
        setProfile(prev => ({
          ...prev,
          trips: prev.trips.map(trip => {
            if (trip._id === tripId) {
              return { ...trip, likes: res.data.likes };
            }
            return trip;
          })
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Please login to like this trip.");
    }
  };

  const handleAddComment = async (e, tripId) => {
    e.preventDefault();
    const text = commentText[tripId];
    if (!text || !text.trim()) return;

    try {
      const res = await API.post(`/trips/${tripId}/comment`, { text });
      if (res.data.success) {
        toast.success("Comment posted successfully!");
        setCommentText(prev => ({ ...prev, [tripId]: "" }));
        // Update local state
        setProfile(prev => ({
          ...prev,
          trips: prev.trips.map(trip => {
            if (trip._id === tripId) {
              return { ...trip, comments: res.data.comments };
            }
            return trip;
          })
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Please login to post a comment.");
    }
  };

  const toggleCommentsExpand = (tripId) => {
    setExpandedComments(prev => ({ ...prev, [tripId]: !prev[tripId] }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPublicProfile(username);
        if (res.data.success) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load public profile");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const r = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          style={{
            color: i <= r ? "var(--gold-primary)" : "var(--text-muted)",
            fill: i <= r ? "var(--gold-primary)" : "none",
            marginRight: "2px",
          }}
        />
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        {stars}
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>
          ({rating || 0})
        </span>
      </div>
    );
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="glass-card animate-fade" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <h3 style={{ color: "var(--error)", marginBottom: "1rem" }}>Profile Not Found</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>{error}</p>
            <Link to="/dashboard" className="btn-gold">Back to Dashboard</Link>
          </div>
        ) : !profile ? (
          <div className="glass-card animate-fade" style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>No Profile Data</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>The user profile could not be retrieved.</p>
            <Link to="/dashboard" className="btn-gold">Back to Dashboard</Link>
          </div>
        ) : (
          <div>
            {/* Top User Bio Card */}
            <div 
              className="glass-card animate-slide"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                padding: "3rem 2rem",
                marginBottom: "2.5rem",
                border: "1px solid var(--gold-border)"
              }}
            >
              <div 
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(212, 175, 55, 0.05)",
                  border: "2px solid var(--gold-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  marginBottom: "1.5rem",
                  boxShadow: "0 0 15px var(--gold-glow)"
                }}
              >
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={50} style={{ color: "var(--gold-primary)" }} />
                )}
              </div>

              <h2 style={{ fontSize: "1.6rem", textTransform: "none", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                {profile.name}
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--gold-primary)", fontWeight: "600", marginBottom: "1rem" }}>
                @{profile.username}
              </p>
              
              {profile.bio ? (
                <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", maxWidth: "550px", lineHeight: "1.6", margin: "0 auto" }}>
                  {profile.bio}
                </p>
              ) : (
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                  This traveler has not written a bio yet.
                </p>
              )}
            </div>

            {/* Public Trips Section */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.25rem", color: "var(--text-primary)", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
                Shared Travel Adventures ({profile.trips.length})
              </h3>
            </div>

            {profile.trips.length === 0 ? (
              <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  This user hasn't created or shared any trips yet.
                </p>
              </div>
            ) : (
              <div className="trips-list-grid">
                {profile.trips.map((trip, index) => (
                  <div 
                    key={index}
                    className="glass-card trip-card animate-slide" 
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "start",
                      minHeight: "380px",
                      height: "auto",
                      padding: "0",
                      overflow: "hidden",
                      border: "1px solid var(--gold-border)",
                      borderRadius: "16px",
                      transition: "all var(--transition-normal)",
                      position: "relative"
                    }}
                  >
                    {/* Hero Image Container */}
                    <div style={{ position: "relative", height: "150px", width: "100%", overflow: "hidden" }}>
                      <img
                        src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80"}
                        alt={trip.destination}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{
                        position: "absolute",
                        top: "0",
                        left: "0",
                        right: "0",
                        bottom: "0",
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(5,5,5,0.85) 100%)"
                      }} />
                      
                      {/* Destination Text Overlay */}
                      <div style={{
                        position: "absolute",
                        bottom: "0.5rem",
                        left: "1.25rem"
                      }}>
                        <span style={{
                          fontSize: "0.75rem",
                          color: "var(--gold-primary)",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}>
                          <MapPin size={12} /> {trip.destination}
                        </span>
                      </div>
                    </div>

                    {/* Card Details Body */}
                    <div style={{ padding: "1.25rem", flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <h3 
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: "750",
                            textTransform: "none",
                            letterSpacing: "0",
                            color: "var(--text-primary)",
                            marginBottom: "0.15rem",
                            lineHeight: "1.3",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                          title={trip.title}
                        >
                          {trip.title}
                        </h3>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          <Calendar size={13} style={{ color: "var(--gold-primary)" }} />
                          <span>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Rating Section */}
                      <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "0.6rem", marginTop: "0.5rem" }}>
                        {renderStars(trip.rating)}
                      </div>

                      {/* Likes and Comments Counters & Action buttons */}
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center", borderTop: "1px solid var(--glass-border)", paddingTop: "0.6rem", marginTop: "0.5rem", paddingBottom: "0.5rem", paddingLeft: "1.25rem", paddingRight: "1.25rem" }}>
                        <button 
                          onClick={() => handleLikeTrip(trip._id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.8rem",
                            padding: "0"
                          }}
                        >
                          <Heart size={14} style={{ color: "var(--error)", fill: (trip.likes || []).length > 0 ? "var(--error)" : "none" }} />
                          <span>{(trip.likes || []).length} Likes</span>
                        </button>

                        <button 
                          onClick={() => toggleCommentsExpand(trip._id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.8rem",
                            padding: "0"
                          }}
                        >
                          <MessageSquare size={14} style={{ color: "var(--gold-primary)" }} />
                          <span>{(trip.comments || []).length} Comments</span>
                        </button>
                      </div>

                      {/* Expanded Comments List & Form */}
                      {expandedComments[trip._id] && (
                        <div style={{ borderTop: "1px solid var(--glass-border)", padding: "0.75rem 1.25rem 1.25rem 1.25rem", background: "rgba(255,255,255,0.01)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "150px", overflowY: "auto", marginBottom: "0.75rem", textAlign: "left" }}>
                            {(trip.comments || []).length === 0 ? (
                              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>No comments yet.</p>
                            ) : (
                              trip.comments.map((c, i) => (
                                <div key={i} style={{ fontSize: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "0.25rem" }}>
                                  <strong style={{ color: "var(--gold-primary)" }}>@{c.username}: </strong>
                                  <span style={{ color: "var(--text-primary)", textTransform: "none" }}>{c.text}</span>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={(e) => handleAddComment(e, trip._id)} style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                              type="text"
                              placeholder="Write a comment..."
                              value={commentText[trip._id] || ""}
                              onChange={(e) => setCommentText({ ...commentText, [trip._id]: e.target.value })}
                              className="form-input"
                              style={{ fontSize: "0.75rem", padding: "0.4rem 0.6rem", height: "auto" }}
                            />
                            <button type="submit" className="btn-gold" style={{ padding: "0.4rem", borderRadius: "8px" }}>
                              <Send size={12} />
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PublicProfile;
