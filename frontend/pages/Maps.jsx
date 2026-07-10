import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { getPlaces, getNearby } from "../services/tripApi.js";
import { Map, Search, Hotel, Utensils, Compass, ExternalLink } from "lucide-react";

const Maps = () => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [activeType, setActiveType] = useState("hotel"); // hotel, restaurant, tourist_attraction
  
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [error, setError] = useState("");

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoadingLoc(true);
    setError("");
    setLocation(null);
    setPlaces([]);

    try {
      const res = await getPlaces(query);
      if (res.data.success) {
        setLocation(res.data.location);
        // Automatically fetch nearby hotels
        fetchNearbyPlaces(res.data.location.lat, res.data.location.lng, "hotel");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Location search failed");
    } finally {
      setLoadingLoc(false);
    }
  };

  const fetchNearbyPlaces = async (lat, lng, type) => {
    setLoadingNearby(true);
    setPlaces([]);
    setActiveType(type);
    try {
      const res = await getNearby(lat, lng, type);
      if (res.data.success) {
        setPlaces(res.data.places);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNearby(false);
    }
  };

  const toggleNearbyType = (type) => {
    if (!location) return;
    fetchNearbyPlaces(location.lat, location.lng, type);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Map size={22} style={{ color: "var(--gold-primary)" }} />
          <h2>Explore Maps & Places</h2>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchLocation} className="glass-card" style={{
          display: "flex",
          gap: "1rem",
          alignItems: "end",
          maxWidth: "500px",
          marginBottom: "2rem"
        }}>
          <div style={{ flex: 1, marginBottom: 0 }}>
            <Input
              label="Enter City / Destination"
              id="mapInput"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Paris"
              required
              style={{ marginBottom: 0 }}
            />
          </div>
          <Button type="submit" disabled={loadingLoc}>
            <Search size={16} /> Locate
          </Button>
        </form>

        {loadingLoc && <Loader />}

        {error && (
          <div className="glass-card" style={{ color: "var(--error)", borderColor: "var(--error)", maxWidth: "500px" }}>
            {error}
          </div>
        )}

        {location && (
          <div className="animate-slide" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Located Details Card */}
            <div className="glass-card" style={{
              display: "flex",
              justifyContent: "between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.5rem"
            }}>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: "600" }}>
                  Located Coordinates
                </span>
                <h3 style={{ textTransform: "none", fontSize: "1.3rem", marginTop: "0.25rem", color: "var(--text-primary)" }}>
                  {location.name}
                </h3>
                <p style={{ fontSize: "0.85rem", marginTop: "0.15rem" }}>{location.formattedAddress}</p>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                  Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
                </div>
              </div>

              <a
                href={location.mapsLink}
                target="_blank"
                rel="noreferrer"
                className="btn-gold"
              >
                Open in Google Maps <ExternalLink size={14} />
              </a>
            </div>

            {/* Nearby Selection Tabs */}
            <div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <button
                  className={`btn-outline ${activeType === "hotel" ? "btn-gold" : ""}`}
                  onClick={() => toggleNearbyType("hotel")}
                  style={{ textTransform: "capitalize", padding: "0.5rem 1rem", color: activeType === "hotel" ? "#000" : "" }}
                >
                  <Hotel size={14} /> Hotels
                </button>
                <button
                  className={`btn-outline ${activeType === "restaurant" ? "btn-gold" : ""}`}
                  onClick={() => toggleNearbyType("restaurant")}
                  style={{ textTransform: "capitalize", padding: "0.5rem 1rem", color: activeType === "restaurant" ? "#000" : "" }}
                >
                  <Utensils size={14} /> Restaurants
                </button>
                <button
                  className={`btn-outline ${activeType === "tourist_attraction" ? "btn-gold" : ""}`}
                  onClick={() => toggleNearbyType("tourist_attraction")}
                  style={{ textTransform: "capitalize", padding: "0.5rem 1rem", color: activeType === "tourist_attraction" ? "#000" : "" }}
                >
                  <Compass size={14} /> Attractions
                </button>
              </div>

              {loadingNearby ? (
                <Loader />
              ) : places.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                  No nearby places discovered for this category.
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem"
                }}>
                  {places.map((place, idx) => (
                    <div key={idx} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "between", height: "180px" }}>
                      <div>
                        <h4 style={{ fontSize: "1rem", textTransform: "none", color: "var(--text-primary)" }}>{place.name}</h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0" }}>{place.address}</p>
                        <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.8rem", color: "var(--gold-primary)", fontWeight: "600", marginTop: "0.5rem" }}>
                          <span>★ {place.rating}</span>
                          <span style={{ color: "var(--text-muted)" }}>({place.userRatingsTotal} ratings)</span>
                        </div>
                      </div>

                      <a
                        href={place.mapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline"
                        style={{ alignSelf: "start", padding: "4px 8px", fontSize: "0.75rem", marginTop: "1rem" }}
                      >
                        Navigate <ExternalLink size={10} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Maps;
