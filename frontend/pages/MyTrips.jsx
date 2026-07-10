import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import TripCard from "../components/TripCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { getTrips } from "../services/tripApi.js";
import { Briefcase, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyTrips = () => {
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await getTrips();
        if (res.data.success) {
          setTrips(res.data.trips);
        }
      } catch (err) {
        console.error("Failed to load trips", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <div>
            <h2>My Premium Trips</h2>
            <p style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
              Explore and coordinate your luxury travel itineraries.
            </p>
          </div>
          <button onClick={() => navigate("/trips/create")} className="btn-gold">
            <Plus size={16} /> Create Trip
          </button>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: "2rem" }}>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or destination..."
          />
        </div>

        {loading ? (
          <Loader />
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={searchTerm ? "No Matches Found" : "No Trips Found"}
            message={
              searchTerm
                ? "Refine your query terms to discover matches in the vault."
                : "Create your first trip to build checklists, logs, and document stores."
            }
            actionText={searchTerm ? "" : "Plan Trip Manually"}
            onAction={searchTerm ? null : () => navigate("/trips/create")}
          />
        ) : (
          <div className="trips-list-grid">
            {filteredTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyTrips;
