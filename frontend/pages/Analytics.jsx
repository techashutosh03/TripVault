import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Loader from "../components/Loader.jsx";
import { getAnalytics } from "../services/tripApi.js";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { BarChart3, TrendingUp, Award, ClipboardCheck, ArrowUpRight } from "lucide-react";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getAnalytics();
        if (res.data.success) {
          setData(res.data.analytics);
        }
      } catch (err) {
        console.error("Failed to load analytics", err);
        setError("Failed to retrieve travel statistics from the vault.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ["#d4af37", "#f39c12", "#2ecc71", "#e74c3c", "#3498db", "#9b59b6", "#1abc9c"];

  // Prepare chart datasets
  const budgetVsSpentData = data ? [
    {
      name: "Funds Allocation (INR)",
      Budget: data.budget,
      Spent: data.spent
    }
  ] : [];

  const tripStatsData = data ? [
    { name: "Completed", value: data.completedTrips },
    { name: "Upcoming", value: data.upcomingTrips }
  ] : [];

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <BarChart3 size={22} style={{ color: "var(--gold-primary)" }} />
          <h2>Travel Vault Analytics</h2>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="glass-card" style={{ color: "var(--error)", borderColor: "var(--error)" }}>
            {error}
          </div>
        ) : !data ? (
          <div className="glass-card" style={{ textAlign: "center", padding: "3rem" }}>
            No analytics data compiled yet. Create trips and log expenses to populate charts.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            {/* Numeric Metrics Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem" }}>
              
              <div className="glass-card animate-slide" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "rgba(212,175,55,0.08)", padding: "12px", borderRadius: "50%", color: "var(--gold-primary)" }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>TOTAL TRIBS PLANNED</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>{data.tripCount}</div>
                </div>
              </div>

              <div className="glass-card animate-slide" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "rgba(46,204,113,0.08)", padding: "12px", borderRadius: "50%", color: "var(--success)" }}>
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>PACKING EFFICIENCY</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--success)" }}>{data.packingProgress?.percentage || 0}%</div>
                </div>
              </div>

              <div className="glass-card animate-slide" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "rgba(212,175,55,0.08)", padding: "12px", borderRadius: "50%", color: "var(--gold-primary)" }}>
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>UPCOMING DEPARTURES</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)" }}>{data.upcomingTrips}</div>
                </div>
              </div>

              <div className="glass-card animate-slide" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "rgba(231,76,60,0.08)", padding: "12px", borderRadius: "50%", color: "var(--error)" }}>
                  <ArrowUpRight size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ACCUMULATED OUTFLOWS</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--error)" }}>₹{data.spent.toLocaleString()}</div>
                </div>
              </div>

            </div>

            {/* Graphs Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }} className="analytics-charts-grid">
              
              {/* Card: Budget vs Spent Bar Chart */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
                <h4 style={{ color: "var(--gold-primary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>Budget Allocations vs Actual Outflows</h4>
                <div style={{ width: "100%", height: "260px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetVsSpentData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" />
                      <YAxis stroke="var(--text-secondary)" />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="Budget" fill="var(--gold-primary)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="var(--error)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card: Expenses Category breakdown Pie Chart */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h4 style={{ color: "var(--gold-primary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>Expense Categories Breakdown</h4>
                {data.expenseSummary?.length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No travel expenses logged in your trips yet.
                  </div>
                ) : (
                  <>
                    <div style={{ width: "100%", height: "200px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.expenseSummary}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="category"
                          >
                            {data.expenseSummary.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center", marginTop: "1rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1rem", width: "100%" }}>
                      {data.expenseSummary.map((entry, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS[idx % COLORS.length] }}></span>
                          <span style={{ color: "var(--text-secondary)" }}>{entry.category}: ₹{entry.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Row 3 Graphs: Packing and Trip Status distributions */}
            <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1.2fr", gap: "1.5rem" }} className="analytics-charts-grid-row2">
              
              {/* Card: Trip Status distributions */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <h4 style={{ color: "var(--gold-primary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>Travel Status Distribution</h4>
                <div style={{ width: "100%", height: "180px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tripStatsData}
                        cx="50%"
                        cy="50%"
                        outerRadius={65}
                        dataKey="value"
                      >
                        <Cell fill="var(--success)" />
                        <Cell fill="var(--gold-primary)" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card: Packing Checklist Performance area chart */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
                <h4 style={{ color: "var(--gold-primary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>Packing Completeness & Efficiency</h4>
                <div style={{ padding: "0 1rem", marginBottom: "1rem" }}>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                    Currently, you have packed **{data.packingProgress?.packed}** items out of **{data.packingProgress?.total}** travel items logged across all itineraries. Keep your efficiency high to avoid travel surprises!
                  </p>
                </div>
                <div style={{ width: "100%", height: "120px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: "Start", packed: 0 },
                        { name: "Progress", packed: Math.round(data.packingProgress?.packed / 2) },
                        { name: "Current", packed: data.packingProgress?.packed }
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                      <Tooltip />
                      <Area type="monotone" dataKey="packed" stroke="var(--success)" fill="rgba(46, 204, 113, 0.1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Analytics;
