import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { generateAIPlan } from "../services/tripApi.js";
import { Sparkles, Send } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const AIChat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(location.state?.prompt || "");
  const [messages, setMessages] = useState([
    {
      sender: "assistant",
      text: "Welcome to TripVault Elite AI Planner. Tell me about your dream vacation! For example: 'Plan a luxury 10-day Switzerland trip under ₹5 lakh.'"
    }
  ]);
  const [loading, setLoading] = useState(false);

  // Autostart generation if navigated with prompt in state
  useEffect(() => {
    if (location.state?.prompt) {
      const autoSubmit = async () => {
        const userMessage = location.state.prompt;
        setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
        setLoading(true);
        try {
          setMessages((prev) => [
            ...prev,
            { sender: "assistant", text: "Orchestrating plans, building itineraries, detailing expenses, and preparing checklists. Please wait, this takes a few moments..." }
          ]);
          
          const res = await generateAIPlan(userMessage);

          if (res.data.success) {
            setMessages((prev) => [...prev, { sender: "assistant", text: "🎉 Success! The vault has successfully cataloged your trip. Redirecting you to your itinerary..." }]);
            setTimeout(() => {
              navigate(`/trips/${res.data.trip._id}`, { replace: true });
            }, 1500);
          }
        } catch (err) {
          setMessages((prev) => [
            ...prev,
            { sender: "assistant", text: `⚠️ Failed to construct plan: ${err.response?.data?.message || "Internal error occurred. Please try again."}` }
          ]);
        } finally {
          setLoading(false);
        }
      };
      
      autoSubmit();
      
      // Clear location state to prevent resubmission on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = prompt;
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setPrompt("");
    setLoading(true);

    try {
      setMessages((prev) => [...prev, { sender: "assistant", text: "Orchestrating plans, building itineraries, detailing expenses, and preparing checklists. Please wait, this takes a few moments..." }]);
      
      const res = await generateAIPlan(userMessage);

      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: "assistant", text: "🎉 Success! The vault has successfully cataloged your trip. Redirecting you to your itinerary..." }]);
        setTimeout(() => {
          navigate(`/trips/${res.data.trip._id}`);
        }, 1500);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "assistant", text: `⚠️ Failed to construct plan: ${err.response?.data?.message || "Internal error occurred. Please try again."}` }
      ]);
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
          <Sparkles size={22} style={{ color: "var(--gold-primary)" }} />
          <h2>AI Travel Planner</h2>
        </div>

        <div className="glass-card ai-chat-window animate-slide">
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-bubble ${m.sender}`}>
                <p style={{ color: "inherit", fontSize: "0.9rem" }}>{m.text}</p>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start" }}>
                <Loader />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-input-bar">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Plan a luxury 10-day Switzerland trip under ₹5 lakh."
              disabled={loading}
              className="chat-input"
            />
            <Button type="submit" disabled={loading || !prompt.trim()}>
              <Send size={16} /> Send
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIChat;
