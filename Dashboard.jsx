import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import StatCard from "../components/StatCard.jsx";
import Loader from "../components/Loader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import TripCard from "../components/TripCard.jsx";
import { 
  getAnalytics, 
  getTrips, 
  getItinerary, 
  getWeather, 
  getNotifications 
} from "../services/tripApi.js";
import { 
  getDestinationImage, 
  getDestinationFlag 
} from "../services/travelHelpers.js";
import { 
  Briefcase, 
  Plane, 
  CheckSquare, 
  IndianRupee, 
  PieChart, 
  Bell, 
  Plus, 
  Sparkles, 
  Calendar, 
  CloudSun, 
  TrendingUp, 
  ChevronRight,
  Sun,
  CloudRain,
  Cloud,
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [trips, setTrips] = useState([]);
  const [nextTrip, setNextTrip] = useState(null);
  const [nextTripItinerary, setNextTripItinerary] = useState([]);
  const [nextTripWeather, setNextTripWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // AI Prompt Widget state
  const [aiPrompt, setAiPrompt] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 1. Fetch general stats & all trips
        const [analyticsRes, tripsRes] = await Promise.all([
          getAnalytics().catch(err => { console.error(err); return { data: { success: false } }; }),
          getTrips().catch(err => { console.error(err); return { data: { success: false } }; })
        ]);

        let userTrips = [];
        if (tripsRes.data?.success) {
          userTrips = tripsRes.data.trips;
          setTrips(userTrips);
        }

        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.analytics);
        }

        // 2. Identify the closest upcoming trip
        const now = new Date();
        const upcoming = userTrips
          .filter(t => new Date(t.startDate) > now)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        const next = upcoming[0] || null;
        setNextTrip(next);

        // 3. Fetch secondary details (Itinerary, Weather, Alerts) based on next trip
        if (next) {
          try {
            const [itiRes, weatherRes, notifRes] = await Promise.all([
              getItinerary(next._id).catch(() => null),
              getWeather(next.destination).catch(() => null),
              getNotifications().catch(() => null)
            ]);

            if (itiRes?.data?.success && Array.isArray(itiRes.data.itinerary)) {
              // Extract first 3 activities
              const activities = [];
              itiRes.data.itinerary.forEach(day => {
                if (day.activities) {
                  day.activities.forEach(act => {
                    activities.push({
                      day: day.dayNumber,
                      time: act.time,
                      activity: act.title
                    });
                  });
                }
              });
              setNextTripItinerary(activities.slice(0, 3));
            }

            if (weatherRes?.data?.success) {
              setNextTripWeather(weatherRes.data.weather);
            } else {
              // Mock weather if API returns mock or fails
              setNextTripWeather({
                source: "demo",
                current: { temp: 22, description: "scattered clouds" },
                forecast: [
                  { day: "Tomorrow", temp: 24, cond: "Clear" },
                  { day: "Next Day", temp: 20, cond: "Clouds" }
                ]
              });
            }

            if (notifRes?.data?.success) {
              setAlerts(notifRes.data.notifications.filter(n => !n.isRead).slice(0, 3));
            }
          } catch (err) {
            console.error("Failed to load secondary trip details:", err);
          }
        } else {
          // If no upcoming trip, check global alerts
          try {
            const notifRes = await getNotifications().catch(() => null);
            if (notifRes?.data?.success) {
              setAlerts(notifRes.data.notifications.filter(n => !n.isRead).slice(0, 3));
            }
          } catch (err) {
            console.error(err);
          }
        }

      } catch (err) {
        console.error("Dashboard Core load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ["#d4af37", "#f39c12", "#e67e22", "#e74c3c", "#9b59b6", "#3498db", "#2ecc71"];

  // Default mock allocation data to show a rich donut breakdown when user hasn't logged real expenses yet
  const mockExpenseSummary = [
    { category: "Hotel", amount: 120000 },
    { category: "Flight", amount: 90000 },
    { category: "Food", amount: 35000 },
    { category: "Shopping", amount: 50000 },
    { category: "Transport", amount: 25000 }
  ];

  // Helper for weather icons
  const getWeatherIcon = (desc) => {
    const d = desc?.toLowerCase() || "";
    if (d.includes("rain") || d.includes("drizzle")) return <CloudRain size={24} style={{ color: "#3498db" }} />;
    if (d.includes("cloud") || d.includes("overcast")) return <Cloud size={24} style={{ color: "#a0a0a0" }} />;
    return <Sun size={24} style={{ color: "#f1c40f" }} />;
  };

  // Helper for dynamic countdown days calculation
  const getCountdownDays = (startDateStr) => {
    const diff = new Date(startDateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days <= 0 ? 0 : days;
  };

  const handleAiPlanSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    navigate("/ai-chat", { state: { prompt: aiPrompt } });
  };

  const handleSuggestionClick = (suggestion) => {
    setAiPrompt(suggestion);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade" style={{ width: "100%", paddingRight: "2rem" }}>
        {/* Dashboard Title Banner */}
        <div style={{ 
          display: "flex", 
          justifyContent: "between", 
          alignItems: "center", 
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <h2>Luxury Command Center</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              Welcome back. Let's orchestrate your elite getaways.
            </p>
          </div>
          <button onClick={() => navigate("/trips/create")} className="btn-gold">
            <Plus size={16} /> New Manual Trip
          </button>
        </div>

        {loading ? (
          <Loader />
        ) : !analytics || analytics.tripCount === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Your Travel Vault is Empty"
            message="Securely build your first luxury travel vault. Let Gemini AI plan your trip or create one manually."
            actionText="Plan with AI"
            onAction={() => navigate("/ai-chat")}
          />
        ) : (
          <>
            {/* 1. Next Upcoming Trip Hero Countdown Banner */}
            {nextTrip ? (
              <div 
                className="glass-card next-trip-banner animate-slide" 
                style={{
                  position: "relative",
                  height: "220px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "2rem",
                  padding: "0",
                  border: "1px solid var(--gold-primary)",
                  boxShadow: "0 8px 32px 0 var(--gold-glow)",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {/* Background Image Cover */}
                <img 
                  src={nextTrip.coverImage || getDestinationImage(nextTrip.destination)} 
                  alt={nextTrip.destination}
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: "1"
                  }}
                />
                {/* Overlay gradient */}
                <div style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  right: "0",
                  bottom: "0",
                  background: "linear-gradient(to right, rgba(5, 5, 5, 0.95) 0%, rgba(5, 5, 5, 0.7) 50%, rgba(5, 5, 5, 0.1) 100%)",
                  zIndex: "2"
                }} />

                {/* Banner Content */}
                <div style={{
                  position: "relative",
                  zIndex: "3",
                  padding: "2rem",
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.5rem"
                }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "1.8rem" }}>{getDestinationFlag(nextTrip.destination)}</span>
                      <span style={{ 
                        fontSize: "0.8rem", 
                        fontWeight: "800", 
                        color: "var(--gold-primary)", 
                        letterSpacing: "0.1em",
                        textTransform: "uppercase"
                      }}>
                        Next Upcoming Adventure
                      </span>
                    </div>
                    <h1 style={{ 
                      fontSize: "2.2rem", 
                      margin: "0", 
                      textTransform: "none", 
                      background: "none", 
                      WebkitTextFillColor: "var(--text-primary)", 
                      color: "var(--text-primary)",
                      fontWeight: "800",
                      lineHeight: "1.2",
                      marginBottom: "0.5rem"
                    }}>
                      {nextTrip.title}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Calendar size={14} style={{ color: "var(--gold-primary)" }} />
                        {new Date(nextTrip.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - {new Date(nextTrip.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span>|</span>
                      <span>{nextTrip.destination}</span>
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div style={{
                    background: "rgba(212, 175, 55, 0.1)",
                    border: "2px solid var(--gold-primary)",
                    borderRadius: "12px",
                    padding: "1rem 1.5rem",
                    textAlign: "center",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 15px rgba(212, 175, 55, 0.15)"
                  }}>
                    <div style={{ fontSize: "2rem", fontWeight: "900", color: "var(--gold-primary)", lineHeight: "1" }}>
                      {getCountdownDays(nextTrip.startDate)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-primary)", textTransform: "uppercase", fontWeight: "700", marginTop: "0.25rem", letterSpacing: "0.05em" }}>
                      Days To Departure
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Promo/Suggest Banner */
              <div 
                className="glass-card next-trip-banner animate-slide" 
                style={{
                  position: "relative",
                  height: "180px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  marginBottom: "2rem",
                  padding: "2rem",
                  border: "1px solid var(--gold-border)",
                  background: "linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(5, 5, 5, 0.5) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1.5rem"
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Where to next?</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "500px" }}>
                    No upcoming travels scheduled. Let our Gemini AI Planner design a customized, luxury itinerary for you in seconds.
                  </p>
                </div>
                <button onClick={() => navigate("/ai-chat")} className="btn-gold" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={16} /> Plan with AI
                </button>
              </div>
            )}

            {/* 2. Stats Grid Row */}
            <div className="stats-grid">
              <StatCard label="Vaulted Trips" value={analytics.tripCount} icon={Briefcase} />
              <StatCard label="Upcoming Trips" value={analytics.upcomingTrips} icon={Plane} />
              <StatCard label="Total Budget" value={`₹${analytics.budget.toLocaleString("en-IN")}`} icon={IndianRupee} color="gold" />
              <StatCard label="Total Spent" value={`₹${analytics.spent.toLocaleString("en-IN")}`} icon={IndianRupee} color="gold" />
              <StatCard
                label="Checklist Completeness"
                value={`${analytics.packingProgress.percentage}%`}
                subtext={`${analytics.packingProgress.packed}/${analytics.packingProgress.total} packed`}
                icon={CheckSquare}
              />
            </div>

            {/* 3. 4-Column Responsive Layout */}
            <div className="dashboard-grid-4col" style={{ display: "grid", gap: "1.5rem", marginBottom: "2rem" }}>
              
              {/* ==================================================
                  COLUMN 1: FINANCIALS & EXPENSE ALLOCATION
                 ================================================== */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Financial Vault Summary Card */}
                <div className="glass-card" style={{
                  background: "linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0) 100%)",
                  border: "1px solid var(--gold-border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 className="dashboard-card-title" style={{ margin: "0" }}>Financial Vault</h3>
                    <TrendingUp size={16} style={{ color: "var(--gold-primary)" }} />
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Budget</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>₹{analytics.budget.toLocaleString("en-IN")}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Outflows</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--error)" }}>₹{analytics.spent.toLocaleString("en-IN")}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remaining Balance</div>
                      <div style={{
                        fontSize: "1.8rem",
                        fontWeight: "900",
                        color: analytics.remaining >= 0 ? "var(--success)" : "var(--error)"
                      }}>
                        ₹{analytics.remaining.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Visual spent gauge bar */}
                  {analytics.budget > 0 && (
                    <div style={{ marginTop: "1.25rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.35rem" }}>
                        <span style={{ color: "var(--text-secondary)" }}>Budget Consumed</span>
                        <span style={{ color: "var(--gold-primary)", fontWeight: "700" }}>
                          {Math.min(100, Math.round((analytics.spent / analytics.budget) * 100))}%
                        </span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ 
                          width: `${Math.min(100, (analytics.spent / analytics.budget) * 100)}%`, 
                          height: "100%", 
                          backgroundColor: analytics.spent > analytics.budget ? "var(--error)" : "var(--gold-primary)",
                          boxShadow: analytics.spent > analytics.budget ? "none" : "0 0 8px var(--gold-primary)"
                        }}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expense Allocation Chart Card */}
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Expense Allocation</h3>
                    <PieChart size={16} style={{ color: "var(--gold-primary)" }} />
                  </div>

                  {/* Render chart data */}
                  {(() => {
                    const isMock = analytics.spent === 0;
                    const chartData = isMock 
                      ? mockExpenseSummary 
                      : analytics.expenseSummary.filter(d => d.amount > 0);

                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: "1", justifyContent: "center" }}>
                        {isMock && (
                          <div style={{ 
                            fontSize: "0.7rem", 
                            color: "var(--gold-primary)", 
                            backgroundColor: "rgba(212, 175, 55, 0.05)",
                            border: "1px solid var(--gold-border)",
                            borderRadius: "4px",
                            padding: "0.35rem 0.5rem",
                            textAlign: "center"
                          }}>
                            💡 Visual Demo: Log expenses to replace this sample.
                          </div>
                        )}
                        <div style={{ height: "140px", width: "100%" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={60}
                                paddingAngle={4}
                                dataKey="amount"
                              >
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", overflowY: "auto", maxHeight: "150px" }}>
                          {chartData.map((entry, index) => (
                            <div key={entry.category} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", justifyContent: "space-between" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ width: "8px", height: "8px", backgroundColor: COLORS[index % COLORS.length], borderRadius: "50%" }}></div>
                                <span style={{ color: "var(--text-secondary)" }}>{entry.category}</span>
                              </div>
                              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>₹{entry.amount.toLocaleString("en-IN")}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* ==================================================
                  COLUMN 2: RECENT TRIPS (VAULTED TRIPS)
                 ================================================== */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="dashboard-card-title">Recent Trips</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", cursor: "pointer", fontSize: "0.8rem", color: "var(--gold-primary)" }} onClick={() => navigate("/trips")}>
                    See all <ChevronRight size={14} />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {analytics.recentTrips.map((trip) => (
                    <TripCard key={trip._id} trip={trip} />
                  ))}
                </div>
              </div>

              {/* ==================================================
                  COLUMN 3: AI COMMAND CENTER (CO-PILOT PLANNER) & ITINERARY
                 ================================================== */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* AI Planner Prompt Card */}
                <div className="glass-card" style={{
                  border: "1px solid var(--gold-border)",
                  background: "linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    <Sparkles size={18} style={{ color: "var(--gold-primary)" }} />
                    <h3 className="dashboard-card-title" style={{ margin: "0" }}>AI Co-Pilot</h3>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    Directly type your destination constraints or select a recommendation below.
                  </p>

                  <form onSubmit={handleAiPlanSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Plan a 10-day Switzerland trip under ₹5 lakh."
                      style={{
                        width: "100%",
                        height: "70px",
                        backgroundColor: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid var(--gold-border)",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        color: "var(--text-primary)",
                        fontSize: "0.8rem",
                        resize: "none",
                        fontFamily: "inherit"
                      }}
                    />
                    <button type="submit" className="btn-gold" style={{ justifyContent: "center", width: "100%", fontSize: "0.8rem", padding: "0.5rem" }}>
                      <Sparkles size={14} /> Plan Instantly
                    </button>
                  </form>

                  {/* Suggestion pills */}
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>
                      Suggestions
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                      <button 
                        onClick={() => handleSuggestionClick("Plan a luxury 10-day Switzerland trip under ₹5 lakh.")}
                        style={{ fontSize: "0.7rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", borderRadius: "12px", padding: "0.25rem 0.5rem", cursor: "pointer" }}
                      >
                        🇨🇭 Swiss Alps 10D
                      </button>
                      <button 
                        onClick={() => handleSuggestionClick("Create a 5-day Maldives luxury honeymoon plan.")}
                        style={{ fontSize: "0.7rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", borderRadius: "12px", padding: "0.25rem 0.5rem", cursor: "pointer" }}
                      >
                        🇲🇻 Maldives 5D
                      </button>
                      <button 
                        onClick={() => handleSuggestionClick("Design a 7-day culinary trip in Tokyo, Japan.")}
                        style={{ fontSize: "0.7rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", color: "var(--text-secondary)", borderRadius: "12px", padding: "0.25rem 0.5rem", cursor: "pointer" }}
                      >
                        🇯🇵 Tokyo Foodie 7D
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upcoming Itinerary Timeline Preview Widget */}
                <div className="glass-card" style={{ flex: "1", display: "flex", flexDirection: "column" }}>
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Timeline Preview</h3>
                    <Calendar size={16} style={{ color: "var(--gold-primary)" }} />
                  </div>

                  {nextTrip ? (
                    nextTripItinerary.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.5rem", flex: "1" }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "700" }}>
                          Upcoming Activities
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          {nextTripItinerary.map((act, index) => (
                            <div key={index} style={{
                              display: "flex",
                              gap: "0.75rem",
                              background: "rgba(255, 255, 255, 0.01)",
                              border: "1px solid var(--glass-border)",
                              borderRadius: "8px",
                              padding: "0.6rem 0.75rem"
                            }}>
                              <div style={{ 
                                color: "var(--gold-primary)", 
                                fontWeight: "800", 
                                fontSize: "0.75rem", 
                                minWidth: "40px", 
                                borderRight: "1px solid var(--glass-border)",
                                marginRight: "0.25rem"
                              }}>
                                Day {act.day}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.7rem", color: "var(--gold-primary)", fontWeight: "600" }}>{act.time}</div>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: "500", marginTop: "0.1rem" }}>{act.activity}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => navigate(`/trips/${nextTrip._id}`)} 
                          style={{
                            marginTop: "auto",
                            background: "none",
                            border: "none",
                            color: "var(--gold-primary)",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0"
                          }}
                        >
                          View Full Itinerary <ChevronRight size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "1", color: "var(--text-secondary)", textAlign: "center", padding: "1.5rem" }}>
                        <Calendar size={24} style={{ color: "var(--gold-primary)", opacity: "0.5", marginBottom: "0.75rem" }} />
                        <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>No Itinerary Generated Yet</div>
                        <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>Generate an itinerary dynamically in your trip details vault.</p>
                        <button 
                          onClick={() => navigate(`/trips/${nextTrip._id}`)} 
                          className="btn-outline" 
                          style={{ fontSize: "0.7rem", padding: "0.4rem 0.8rem", marginTop: "1rem" }}
                        >
                          Open Trip Vault
                        </button>
                      </div>
                    )
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "1", color: "var(--text-secondary)", textAlign: "center", padding: "1.5rem" }}>
                      <Calendar size={24} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
                      <p style={{ fontSize: "0.75rem" }}>Schedule a manual or AI trip to preview timelines.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ==================================================
                  COLUMN 4: WEATHER INTEGRATION & ATTENTION ALERTS
                 ================================================== */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* Weather Forecast Widget Card */}
                <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Live Weather</h3>
                    <CloudSun size={16} style={{ color: "var(--gold-primary)" }} />
                  </div>

                  {nextTrip ? (
                    nextTripWeather ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>{nextTrip.destination}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "capitalize", marginTop: "0.1rem" }}>
                              {nextTripWeather.current.description}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {getWeatherIcon(nextTripWeather.current.description)}
                            <span style={{ fontSize: "1.6rem", fontWeight: "800", color: "var(--text-primary)" }}>
                              {nextTripWeather.current.temp}°C
                            </span>
                          </div>
                        </div>

                        {/* Weather Forecast Row */}
                        <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "0.75rem" }}>
                          <div style={{ fontSize: "0.7rem", textTransform: "uppercase", color: "var(--text-secondary)", fontWeight: "700", marginBottom: "0.5rem" }}>
                            Forecast
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                            {nextTripWeather.forecast.map((f, idx) => (
                              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>{f.day}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--glass-border)", borderRadius: "4px", padding: "0.1rem 0.3rem", color: "var(--text-secondary)" }}>
                                    {f.cond}
                                  </span>
                                  <span style={{ fontWeight: "700", color: "var(--text-primary)" }}>{f.temp}°C</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                        Loading destination weather...
                      </div>
                    )
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: "1", color: "var(--text-secondary)", textAlign: "center", padding: "1.5rem" }}>
                      <CloudSun size={24} style={{ color: "var(--text-muted)", marginBottom: "0.75rem" }} />
                      <p style={{ fontSize: "0.75rem" }}>No active trip to resolve weather indicators.</p>
                    </div>
                  )}
                </div>

                {/* Attention Alerts / Notification Widget Card */}
                <div className="glass-card" style={{ flex: "1", display: "flex", flexDirection: "column" }}>
                  <div className="dashboard-card-header">
                    <h3 className="dashboard-card-title">Vault Alerts</h3>
                    <Bell size={16} style={{ color: "var(--gold-primary)" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem", flex: "1" }}>
                    {alerts.length > 0 ? (
                      alerts.map((alert) => (
                        <div 
                          key={alert._id} 
                          style={{
                            background: "rgba(231, 76, 60, 0.03)",
                            border: "1px solid rgba(231, 76, 60, 0.15)",
                            borderRadius: "8px",
                            padding: "0.6rem 0.75rem",
                            display: "flex",
                            gap: "0.5rem"
                          }}
                        >
                          <AlertTriangle size={16} style={{ color: "var(--error)", flexShrink: "0", marginTop: "0.15rem" }} />
                          <div>
                            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>
                              {alert.title}
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: "0.1rem", lineHeight: "1.3" }}>
                              {alert.message}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        flex: "1", 
                        color: "var(--text-secondary)", 
                        textAlign: "center", 
                        padding: "1.5rem" 
                      }}>
                        <CheckSquare size={22} style={{ color: "var(--success)", opacity: "0.6", marginBottom: "0.5rem" }} />
                        <div style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--success)" }}>Vault Fully Secure</div>
                        <p style={{ fontSize: "0.7rem", marginTop: "0.2rem", color: "var(--text-secondary)" }}>
                          No warnings or outstanding actions found.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
