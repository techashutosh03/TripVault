import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import { getTripDetails, updateTrip, uploadTripPhoto } from "../services/tripApi.js";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle, Star } from "lucide-react";

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(5);
  
  // Backward compatibility & upload fields
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [coverImage, setCoverImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await getTripDetails(id);
        if (res.data.success) {
          const t = res.data.trip;
          setTitle(t.title);
          setDestination(t.destination);
          
          setStartDate(new Date(t.startDate).toISOString().split("T")[0]);
          setEndDate(new Date(t.endDate).toISOString().split("T")[0]);
          
          setDescription(t.description || t.notes || "");
          setRating(t.rating !== undefined ? Number(t.rating) : 5);
          setBudget(t.budget || "");
          setTravelers(t.travelers || "1");
          setCoverImage(t.coverImage || "");
          if (t.coverImage) {
            setPreviewUrl(t.coverImage);
          }
        }
      } catch (err) {
        setError("Failed to fetch trip details");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

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
        description,
        rating: Number(rating) || 5,
        budget: Number(budget) || 0,
        travelers: Number(travelers) || 1,
        notes: description,
      });

      if (res.data.success) {
        if (selectedFile) {
          const formData = new FormData();
          formData.append("image", selectedFile);
          await uploadTripPhoto(id, formData);
        }
        navigate("/dashboard");
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

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="description" className="form-label">Description / Travel Notes</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "0.5rem" }}>Trip Cover Image</label>
              
              {previewUrl && (
                <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "8px", overflow: "hidden", marginBottom: "1rem", border: "1px solid var(--gold-border)" }}>
                  <img src={previewUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(""); }}
                    style={{
                      position: "absolute", top: "10px", right: "10px",
                      background: "rgba(0,0,0,0.7)", border: "none", color: "#fff",
                      borderRadius: "50%", width: "30px", height: "30px",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: "bold", fontSize: "14px"
                    }}
                  >
                    X
                  </button>
                </div>
              )}

              <div 
                className={`upload-dropzone ${dragging ? "dragging" : ""}`}
                onClick={() => document.getElementById("coverFileInput").click()} 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{ 
                  padding: "1.5rem", 
                  marginBottom: "0",
                  borderColor: dragging ? "var(--gold-primary)" : "var(--gold-border)",
                  backgroundColor: dragging ? "rgba(212, 175, 55, 0.05)" : "transparent"
                }}
              >
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop or click to upload cover image"}
                </p>
                <input
                  id="coverFileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </div>
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
