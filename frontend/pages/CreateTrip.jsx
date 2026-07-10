import React, { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { createTrip } from "../services/tripApi.js";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle, Star } from "lucide-react";

const CreateTrip = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5);
  
  // Backward compatibility fields
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [coverImage, setCoverImage] = useState("");
  
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after the end date");
      return;
    }

    setSubmitting(true);
    try {
      const res = await createTrip({
        title,
        destination,
        startDate,
        endDate,
        description,
        rating: Number(rating) || 5,
        budget: Number(budget) || 0,
        travelers: Number(travelers) || 1,
        notes: description, // Match notes to description for compatibility
        coverImage,
      });

      if (res.data.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create trip");
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
          <h2>Plan a New Adventure</h2>
        </div>

        <div className="glass-card animate-slide" style={{ maxWidth: "600px" }}>
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

          <form onSubmit={handleSubmit}>
            <Input
              label="Trip Title"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer in Swiss Alps"
              required
            />

            <Input
              label="Destination"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Switzerland"
              required
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="Start Date"
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              <Input
                label="End Date"
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="description" className="form-label">Description / Travel Notes</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your premium trip destinations, hotel plans, or packing details..."
                className="form-input"
                style={{ height: "100px", resize: "vertical" }}
                required
              />
            </div>

            {/* Interactive Rating Selector */}
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Trip Rating</label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.25rem",
                      color: star <= rating ? "var(--gold-primary)" : "var(--text-muted)",
                      transition: "transform 0.1s ease"
                    }}
                  >
                    <Star size={28} fill={star <= rating ? "var(--gold-primary)" : "none"} />
                  </button>
                ))}
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginLeft: "0.5rem", fontWeight: "600" }}>
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Premium compatibility fields */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <Input
                label="Estimated Budget (INR)"
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="400000"
              />

              <Input
                label="Number of Travelers"
                id="travelers"
                type="number"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                min="1"
              />
            </div>

            <Input
              label="Cover Image URL (Optional)"
              id="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-xxx..."
            />

            <div style={{ display: "flex", justifyContent: "end", gap: "1rem", marginTop: "1.5rem" }}>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Trip"} <Save size={16} />
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateTrip;
