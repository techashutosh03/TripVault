import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Loader from "../components/Loader.jsx";
import Skeleton from "../components/Skeleton.jsx";
import TripCard from "../components/TripCard.jsx";
import { getTrips, deleteTrip } from "../services/tripApi.js";
import { Plus, Briefcase, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await getTrips();
      if (res.data.success) {
        setTrips(res.data.trips || []);
      }
    } catch (err) {
      console.error("Failed to load trips", err);
      setError("Failed to load trips from the vault.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDeleteTrip = async (id) => {
    try {
      const res = await deleteTrip(id);
      if (res.data.success) {
        toast.success("Trip deleted successfully.");
        fetchTrips();
      }
    } catch (err) {
      console.error("Failed to delete trip:", err);
      const errMsg = err.response?.data?.message || "Failed to delete the trip.";
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        {/* Top Header Banner */}
        <div 
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem"
          }}
        >
          <div>
            <h2>Luxury Travel Dashboard</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              Securely orchestrate and review your elite adventures.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button 
              onClick={() => {
                if (user && user.username) {
                  navigate(`/profile/${user.username}`);
                } else {
                  navigate("/profile");
                }
              }} 
              className="btn-outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px"
              }}
            >
              My Profile
            </button>
            <button 
              onClick={() => navigate("/trips/create")} 
              className="btn-gold"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                boxShadow: "0 0 10px var(--gold-glow)"
              }}
            >
              <Plus size={16} /> + Create Trip
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: "rgba(231, 76, 60, 0.1)",
            border: "1px solid var(--error)",
            padding: "0.75rem",
            borderRadius: "8px",
            color: "var(--error)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem"
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="trips-list-grid">
            <Skeleton type="card" count={3} />
          </div>
        ) : trips.length === 0 ? (
          /* Empty State as requested */
          <div 
            className="glass-card animate-fade" 
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "5rem 2rem",
              margin: "1.5rem 0",
              gap: "1.5rem",
              border: "1px solid var(--gold-border)",
              boxShadow: "0 8px 32px 0 rgba(0,0,0,0.2)"
            }}
          >
            <div style={{
              backgroundColor: "rgba(212, 175, 55, 0.05)",
              border: "1px solid var(--gold-border)",
              padding: "1.25rem",
              borderRadius: "50%",
              color: "var(--gold-primary)",
              boxShadow: "0 0 15px var(--gold-glow)"
            }}>
              <Briefcase size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.3rem", color: "var(--text-primary)", fontWeight: "600", marginBottom: "0.5rem" }}>
                You haven't added any trips yet.
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "450px", margin: "0 auto 1.5rem auto" }}>
                Start your first adventure!
              </p>
            </div>
            <button 
              onClick={() => navigate("/trips/create")} 
              className="btn-gold"
              style={{
                fontSize: "0.85rem",
                padding: "0.6rem 1.5rem",
                borderRadius: "8px"
              }}
            >
              + Create Trip
            </button>
          </div>
        ) : (
          /* Trips Card Grid */
          <div className="trips-list-grid">
            {trips.map((trip) => (
              <TripCard 
                key={trip._id} 
                trip={trip} 
                onDelete={handleDeleteTrip} 
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
