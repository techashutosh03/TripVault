import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { getCurrencyRates, convertCurrency } from "../services/tripApi.js";
import { Coins, ArrowLeftRight } from "lucide-react";

const Currency = () => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  // Conversion calculator states
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("INR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [rate, setRate] = useState(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await getCurrencyRates();
        if (res.data.success) {
          setRates(res.data.rates);
        }
      } catch (err) {
        console.error("Failed to load exchange rates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleConvert = async (e) => {
    if (e) e.preventDefault();
    if (!amount || isNaN(amount)) return;

    setCalculating(true);
    try {
      const res = await convertCurrency({
        from,
        to,
        amount: Number(amount),
      });
      if (res.data.success) {
        setConvertedAmount(res.data.convertedAmount);
        setRate(res.data.rate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  // Auto trigger convert when options change if rates exist
  useEffect(() => {
    if (rates && amount) {
      handleConvert();
    }
  }, [from, to, rates]);

  const currencies = ["INR", "USD", "EUR", "CHF", "JPY", "GBP"];

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Coins size={22} style={{ color: "var(--gold-primary)" }} />
          <h2>Currency Exchange Converter</h2>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="dashboard-grid">
            {/* Left Column: Calculator */}
            <div className="glass-card">
              <h3 style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>Real-time Calculator</h3>
              <form onSubmit={handleConvert}>
                <Input
                  label="Value Amount"
                  id="convAmount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  required
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "1rem", alignItems: "center", margin: "1.5rem 0" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="fromSelect" className="form-label">Source Currency</label>
                    <select
                      id="fromSelect"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      className="form-input"
                    >
                      {currencies.map((cur) => (
                        <option key={cur} value={cur}>{cur}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: "1.2rem",
                    color: "var(--gold-primary)"
                  }}>
                    <ArrowLeftRight size={18} />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="toSelect" className="form-label">Target Currency</label>
                    <select
                      id="toSelect"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      className="form-input"
                    >
                      {currencies.map((cur) => (
                        <option key={cur} value={cur}>{cur}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button type="submit" disabled={calculating} style={{ width: "100%", justifyContent: "center", marginTop: "1rem" }}>
                  {calculating ? "Calculating..." : "Calculate Exchange"}
                </Button>
              </form>

              {/* Conversion Result Display */}
              {convertedAmount !== null && (
                <div className="glass-card animate-slide" style={{
                  marginTop: "2rem",
                  background: "linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(0, 0, 0, 0) 100%)",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>CONVERTED VALUE</div>
                  <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "var(--gold-primary)", margin: "0.5rem 0" }}>
                    {convertedAmount.toLocaleString()} {to}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Exchange Rate: 1 {from} = {rate} {to}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Rates Board relative to USD */}
            <div className="glass-card" style={{ height: "fit-content" }}>
              <h3 style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>Rates Dashboard (USD Base)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {currencies.map((cur) => (
                  <div key={cur} style={{ display: "flex", justifyContent: "between", alignItems: "center", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
                    <span style={{ fontWeight: "700" }}>{cur}</span>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {rates[cur] ? rates[cur].toFixed(4) : "1.0000"}
                    </span>
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

export default Currency;
