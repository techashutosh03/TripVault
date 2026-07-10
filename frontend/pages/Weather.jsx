import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { getWeather } from "../services/tripApi.js";
import { CloudSun, Search, Thermometer, Droplets, Wind, CloudRain } from "lucide-react";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const res = await getWeather(city);
      if (res.data.success) {
        setWeather(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <CloudSun size={22} style={{ color: "var(--gold-primary)" }} />
          <h2>Destination Weather</h2>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="glass-card" style={{
          display: "flex",
          gap: "1rem",
          alignItems: "end",
          maxWidth: "500px",
          marginBottom: "2rem"
        }}>
          <div style={{ flex: 1, marginBottom: 0 }}>
            <Input
              label="Search City"
              id="cityInput"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Zurich"
              required
              style={{ marginBottom: 0 }}
            />
          </div>
          <Button type="submit" disabled={loading}>
            <Search size={16} /> Search
          </Button>
        </form>

        {loading && <Loader />}

        {error && (
          <div className="glass-card" style={{ color: "var(--error)", borderColor: "var(--error)", maxWidth: "500px" }}>
            {error}
          </div>
        )}

        {weather && (
          <div className="animate-slide" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Current Weather Card */}
            <div className="glass-card" style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              alignItems: "center",
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0,0,0,0) 100%)"
            }}>
              <div>
                <span style={{ fontSize: "0.85rem", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: "600" }}>
                  Current Weather
                </span>
                <h1 style={{ fontSize: "3rem", margin: "0.5rem 0" }}>{weather.current.temp}°C</h1>
                <h3 style={{ textTransform: "none", fontSize: "1.2rem", color: "var(--text-primary)" }}>{weather.current.cityName}</h3>
                <p style={{ textTransform: "capitalize", marginTop: "0.25rem" }}>{weather.current.description}</p>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.25rem",
                borderLeft: "1px solid var(--glass-border)",
                paddingLeft: "2rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Thermometer style={{ color: "var(--gold-primary)" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>MIN/MAX</div>
                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{weather.current.tempMin}°C / {weather.current.tempMax}°C</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Droplets style={{ color: "var(--gold-primary)" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>HUMIDITY</div>
                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{weather.current.humidity}%</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Wind style={{ color: "var(--gold-primary)" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>WIND SPEED</div>
                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{weather.current.windSpeed} m/s</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CloudRain style={{ color: "var(--gold-primary)" }} />
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>PRECIPITATION</div>
                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{weather.current.rain} mm</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 Day Forecast Grid */}
            <div>
              <h3 style={{ marginBottom: "1.5rem" }}>5-Day Forecast</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem"
              }}>
                {weather.forecast.map((f, idx) => (
                  <div key={idx} className="glass-card" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
                    <div style={{ fontWeight: "700", color: "var(--gold-primary)", fontSize: "0.95rem" }}>{f.day}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.25rem 0 1rem 0" }}>{f.date}</div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", margin: "0.5rem 0" }}>{f.temp}°C</div>
                    <div style={{ textTransform: "capitalize", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {f.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Weather;
