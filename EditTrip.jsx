import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { getTripDetails, updateTrip } from "../services/tripApi.js";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [notes, setNotes] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await getTripDetails(id);
        if (res.data.success) {
          const t = res.data.trip;
          setTitle(t.title);
          setDestination(t.destination);
          
          // Format ISO date to YYYY-MM-DD
          setStartDate(new Date(t.startDate).toISOString().split("T")[0]);
          setEndDate(new Date(t.endDate).toISOString().split("T")[0]);
          
          setBudget(t.budget);
          setTravelers(t.travelers);
          setNotes(t.notes || "");
          setCoverImage(t.coverImage || "");
        }
      } catch (err) {
        setError("Failed to fetch trip details");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after the end date");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateTrip(id, {
        title,
        destination,
        startDate,
        endDate,
        budget: Number(budget) || 0,
        travelers: Number(travelers) || 1,
        notes,
        coverImage,
      });

      if (res.data.success) {
        navigate(`/trips/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update trip");
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
          <h2>Modify Trip Details</h2>
        </div>

        {loading ? (
          <Loader />
        ) : (
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

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Estimated Budget (INR)"
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="400000"
                  required
                />

                <Input
                  label="Number of Travelers"
                  id="travelers"
                  type="number"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <Input
                label="Cover Image URL (Optional)"
                id="coverImage"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />

              <div className="form-group">
                <label htmlFor="notes" className="form-label">Plan Notes & suggestions</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="form-input"
                  style={{ height: "100px", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "end", gap: "1rem", marginTop: "1.5rem" }}>
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Update Trip"} <Save size={16} />
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default EditTrip;
