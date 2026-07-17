import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Loader from "../components/Loader.jsx";
import Modal from "../components/Modal.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import EmptyState from "../components/EmptyState.jsx";
import confetti from "canvas-confetti";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { 
  getTripDetails, 
  deleteTrip, 
  getItinerary, 
  addItineraryActivity, 
  deleteItineraryActivity, 
  getExpenses, 
  createExpense, 
  deleteExpense, 
  getChecklist, 
  createChecklistItem, 
  updateChecklistItem, 
  deleteChecklistItem, 
  getDocuments, 
  uploadDocument, 
  deleteDocument,
  getPDFDownloadUrl,
  uploadTripPhoto
} from "../services/tripApi.js";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  FileDown, 
  Edit, 
  Trash2, 
  Clock, 
  MapPin, 
  Plus, 
  CheckSquare, 
  UploadCloud, 
  Eye, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");

  // New premium states
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [dragging, setDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }
      const formData = new FormData();
      formData.append("image", file);
      try {
        setLoading(true);
        const res = await uploadTripPhoto(trip._id, formData);
        if (res.data.success) {
          setTrip(res.data.trip);
        }
      } catch (err) {
        alert("Photo upload failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => (prevIndex === 0 ? trip.photos.length - 1 : prevIndex - 1));
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    setLightboxIndex((prevIndex) => (prevIndex === trip.photos.length - 1 ? 0 : prevIndex + 1));
  };

  // State arrays
  const [itineraries, setItineraries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Modal open states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);

  // New item form states
  const [newExpense, setNewExpense] = useState({ title: "", amount: "", category: "Food", paymentMethod: "Cash" });
  const [newActivity, setNewActivity] = useState({ itineraryId: "", time: "09:00 AM", title: "", description: "", location: "" });
  const [newChecklist, setNewChecklist] = useState({ itemName: "", category: "General", quantity: "1", priority: "Medium" });
  const [docUpload, setDocUpload] = useState({ file: null, docType: "Passport", title: "" });

  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const tripRes = await getTripDetails(id);
        if (tripRes.data.success) {
          setTrip(tripRes.data.trip);
        }

        const itineraryRes = await getItinerary(id);
        if (itineraryRes.data.success) {
          setItineraries(itineraryRes.data.itinerary || []);
        }

        const expensesRes = await getExpenses(id);
        if (expensesRes.data.success) {
          setExpenses(expensesRes.data.expenses || []);
        }

        const checklistRes = await getChecklist(id);
        if (checklistRes.data.success) {
          setChecklist(checklistRes.data.checklist || []);
        }

        const docsRes = await getDocuments(id);
        if (docsRes.data.success) {
          setDocuments(docsRes.data.documents || []);
        }
      } catch (err) {
        console.error("Failed to load details data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  const handleDeleteTrip = async () => {
    if (window.confirm("Are you sure you want to permanently delete this trip and all its items?")) {
      try {
        await deleteTrip(id);
        navigate("/trips");
      } catch (err) {
        alert("Failed to delete trip");
      }
    }
  };

  // ============================================
  // Handlers: Itineraries & Activities
  // ============================================
  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const res = await addItineraryActivity(newActivity.itineraryId, {
        time: newActivity.time,
        title: newActivity.title,
        description: newActivity.description,
        location: newActivity.location,
      });

      if (res.data.success) {
        // Refresh itinerary
        const itineraryRes = await getItinerary(id);
        setItineraries(itineraryRes.data.itinerary || []);
        setIsActivityModalOpen(false);
        setNewActivity({ itineraryId: "", time: "09:00 AM", title: "", description: "", location: "" });
      }
    } catch (err) {
      alert("Failed to add activity");
    }
  };

  const handleDeleteActivity = async (itineraryId, activityId) => {
    if (window.confirm("Delete this activity?")) {
      try {
        await deleteItineraryActivity(itineraryId, activityId);
        // Refresh
        const itineraryRes = await getItinerary(id);
        setItineraries(itineraryRes.data.itinerary || []);
      } catch (err) {
        alert("Failed to delete activity");
      }
    }
  };

  // ============================================
  // Handlers: Expenses
  // ============================================
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const res = await createExpense(id, {
        title: newExpense.title,
        amount: Number(newExpense.amount),
        category: newExpense.category,
        paymentMethod: newExpense.paymentMethod,
      });

      if (res.data.success) {
        setExpenses([res.data.expense, ...expenses]);
        setIsExpenseModalOpen(false);
        setNewExpense({ title: "", amount: "", category: "Food", paymentMethod: "Cash" });
      }
    } catch (err) {
      alert("Failed to add expense");
    }
  };

  const handleDeleteExpenseItem = async (expenseId) => {
    if (window.confirm("Delete this expense record?")) {
      try {
        await deleteExpense(expenseId);
        setExpenses(expenses.filter((exp) => exp._id !== expenseId));
      } catch (err) {
        alert("Failed to delete expense");
      }
    }
  };

  // ============================================
  // Handlers: Packing List
  // ============================================
  const handleAddChecklist = async (e) => {
    e.preventDefault();
    try {
      const res = await createChecklistItem({
        tripId: id,
        itemName: newChecklist.itemName,
        category: newChecklist.category,
        quantity: Number(newChecklist.quantity) || 1,
        priority: newChecklist.priority,
      });

      if (res.data.success) {
        setChecklist([...checklist, res.data.item]);
        setIsChecklistModalOpen(false);
        setNewChecklist({ itemName: "", category: "General", quantity: "1", priority: "Medium" });
      }
    } catch (err) {
      alert("Failed to add packing item");
    }
  };

  const handleToggleChecklist = async (itemId, currentStatus) => {
    try {
      const targetStatus = !currentStatus;
      const res = await updateChecklistItem(itemId, { isPacked: targetStatus });

      if (res.data.success) {
        setChecklist(checklist.map((item) => (item._id === itemId ? res.data.item : item)));
        if (targetStatus) {
          // Play confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.8 },
            colors: ["#d4af37", "#ffffff", "#f39c12"]
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChecklistItem = async (itemId) => {
    try {
      await deleteChecklistItem(itemId);
      setChecklist(checklist.filter((item) => item._id !== itemId));
    } catch (err) {
      alert("Failed to delete checklist item");
    }
  };

  // ============================================
  // Handlers: Documents
  // ============================================
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docUpload.file || !docUpload.title) {
      alert("Please select a file and enter a title");
      return;
    }

    setUploadingDoc(true);
    const formData = new FormData();
    formData.append("tripId", id);
    formData.append("docType", docUpload.docType);
    formData.append("title", docUpload.title);
    formData.append("file", docUpload.file);

    try {
      const res = await uploadDocument(formData);
      if (res.data.success) {
        setDocuments([res.data.document, ...documents]);
        setDocUpload({ file: null, docType: "Passport", title: "" });
        // Clear file input manually
        document.getElementById("fileInput").value = "";
      }
    } catch (err) {
      alert("Failed to upload document");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocumentItem = async (docId) => {
    if (window.confirm("Permanently delete this document?")) {
      try {
        await deleteDocument(docId);
        setDocuments(documents.filter((doc) => doc._id !== docId));
      } catch (err) {
        alert("Failed to delete document");
      }
    }
  };

  const spentAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = trip ? trip.budget - spentAmount : 0;

  return (
    <div className="app-container">
      <Sidebar />
      <Navbar />

      <main className="main-content animate-fade">
        {loading ? (
          <Loader />
        ) : !trip ? (
          <EmptyState title="Trip Not Found" message="The requested trip details could not be found." />
        ) : (
          <>
            {/* Large Cover Image Hero Banner */}
            {trip.coverImage && (
              <div 
                style={{
                  position: "relative",
                  width: "100%",
                  height: "320px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  marginBottom: "2rem",
                  border: "1px solid var(--gold-border)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
                }}
              >
                <img 
                  src={trip.coverImage} 
                  alt={trip.title} 
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
                <div 
                  style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(5,5,5,0.95) 100%)"
                  }}
                />
                <div 
                  style={{
                    position: "absolute",
                    bottom: "2rem",
                    left: "2rem",
                    right: "2rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "end",
                    flexWrap: "wrap",
                    gap: "1.5rem"
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.85rem", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.1em" }}>
                      Destination: {trip.destination}
                    </span>
                    <h1 style={{ fontSize: "2.4rem", margin: "0.5rem 0", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.6)" }}>{trip.title}</h1>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.9rem", color: "rgba(255,255,255,0.85)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Calendar size={15} style={{ color: "var(--gold-primary)" }} />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <Users size={15} style={{ color: "var(--gold-primary)" }} />
                        <span>{trip.travelers} Travelers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header Details Card */}
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
              {!trip.coverImage && (
                <div style={{
                  display: "flex",
                  justifyContent: "between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.5rem",
                  marginBottom: "1.5rem"
                }}>
                  <div>
                    <span style={{ fontSize: "0.8rem", color: "var(--gold-primary)", textTransform: "uppercase", fontWeight: "600" }}>
                      Destination: {trip.destination}
                    </span>
                    <h1 style={{ fontSize: "2rem", margin: "0.25rem 0 0.5rem 0" }}>{trip.title}</h1>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Calendar size={14} />
                        <span>
                          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Users size={14} />
                        <span>{trip.travelers} Travelers</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons Row */}
              <div style={{
                display: "flex",
                justifyContent: trip.coverImage ? "end" : "between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem"
              }}>
                {trip.coverImage && (
                  <span style={{ marginRight: "auto", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Manage trip documents and records:
                  </span>
                )}
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                  <a
                    href={getPDFDownloadUrl(trip._id)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-gold"
                  >
                    <FileDown size={16} /> Download Itinerary PDF
                  </a>
                  <button onClick={() => navigate(`/trips/${trip._id}/edit`)} className="btn-outline">
                    <Edit size={16} /> Edit
                  </button>
                  <button onClick={handleDeleteTrip} className="btn-outline" style={{ color: "var(--error)", borderColor: "rgba(231, 76, 60, 0.3)" }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>

              {/* Financial mini summary */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid var(--glass-border)",
                textAlign: "center"
              }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>VAULT BUDGET</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "700" }}>₹{trip.budget.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>TOTAL OUTFLOWS</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--error)" }}>₹{spentAmount.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>BALANCE RESERVES</div>
                  <div style={{
                    fontSize: "1.2rem",
                    fontWeight: "700",
                    color: remainingBudget >= 0 ? "var(--success)" : "var(--error)"
                  }}>
                    ₹{remainingBudget.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tabs-nav">
              <button
                className={`tab-btn ${activeTab === "itinerary" ? "active" : ""}`}
                onClick={() => setActiveTab("itinerary")}
              >
                Itinerary Timeline
              </button>
              <button
                className={`tab-btn ${activeTab === "expenses" ? "active" : ""}`}
                onClick={() => setActiveTab("expenses")}
              >
                Expense Tracker
              </button>
              <button
                className={`tab-btn ${activeTab === "checklist" ? "active" : ""}`}
                onClick={() => setActiveTab("checklist")}
              >
                Checklist ({(checklist || []).filter((c) => c.isPacked).length}/{(checklist || []).length})
              </button>
              <button
                className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
                onClick={() => setActiveTab("documents")}
              >
                Documents Vault
              </button>
              <button
                className={`tab-btn ${activeTab === "suggestions" ? "active" : ""}`}
                onClick={() => setActiveTab("suggestions")}
              >
                Suggestions Notes
              </button>
              <button
                className={`tab-btn ${activeTab === "photos" ? "active" : ""}`}
                onClick={() => setActiveTab("photos")}
              >
                Photos Gallery ({(trip.photos || []).length})
              </button>
            </div>

            {/* Render Tab Contents */}
            {activeTab === "itinerary" && (
              <div className="animate-fade">
                <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3>Schedules & Activities</h3>
                  {(itineraries || []).length > 0 && (
                    <button
                      onClick={() => {
                        setNewActivity({ ...newActivity, itineraryId: itineraries[0]._id });
                        setIsActivityModalOpen(true);
                      }}
                      className="btn-gold"
                    >
                      <Plus size={16} /> Add Activity
                    </button>
                  )}
                </div>

                {(itineraries || []).length === 0 ? (
                  <EmptyState title="No Itinerary Days Defined" message="Click Edit Trip to adjust dates, or plan using AI Planner." />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {itineraries.map((day) => (
                      <div key={day._id} className="glass-card">
                        <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem" }}>
                          <h4 style={{ color: "var(--gold-primary)", fontSize: "1rem" }}>
                            Day {day.dayNumber} - {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                          </h4>
                          <button
                            onClick={() => {
                              setNewActivity({ ...newActivity, itineraryId: day._id });
                              setIsActivityModalOpen(true);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem"
                            }}
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>

                        {(day.activities || []).length === 0 ? (
                          <div style={{ padding: "1.5rem 0", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            No activities logged for this day.
                          </div>
                        ) : (
                          <div className="timeline">
                            {day.activities.map((act) => (
                              <div key={act._id} className="timeline-item">
                                <div className={`timeline-dot ${act.status === "Completed" ? "completed" : ""}`}></div>
                                <div className="timeline-content">
                                  <div style={{ display: "flex", justifyContent: "between", alignItems: "start" }}>
                                    <div>
                                      <div className="timeline-time" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                        <Clock size={12} /> {act.time}
                                      </div>
                                      <h4 style={{ fontSize: "0.95rem", textTransform: "none", margin: "0.25rem 0" }}>{act.title}</h4>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteActivity(day._id, act._id)}
                                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                                      title="Delete Activity"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                  {act.location && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.25rem 0" }}>
                                      <MapPin size={12} style={{ color: "var(--gold-primary)" }} />
                                      <span>{act.location}</span>
                                    </div>
                                  )}
                                  {act.description && (
                                    <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>{act.description}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "expenses" && (
              <div className="animate-fade">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3>Logged Expenses</h3>
                  <button onClick={() => setIsExpenseModalOpen(true)} className="btn-gold">
                    <Plus size={16} /> Log Expense
                  </button>
                </div>

                {(expenses || []).length === 0 ? (
                  <EmptyState title="No Outflows Logged" message="Track flights, bookings, and dinner reservations easily." />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.5rem", marginTop: "1rem" }} className="expenses-visual-grid">
                    <div className="glass-card" style={{ padding: "0" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {expenses.map((exp) => (
                          <div
                            key={exp._id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "1rem",
                              borderBottom: "1px solid var(--glass-border)"
                            }}
                          >
                            <div>
                              <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" }}>
                                {exp.category}
                              </span>
                              <h4 style={{ fontSize: "0.95rem", textTransform: "none", margin: "0.25rem 0 0 0" }}>{exp.title}</h4>
                              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                {new Date(exp.date).toLocaleDateString()} | {exp.paymentMethod}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                              <span style={{ fontWeight: "700", color: "var(--gold-primary)" }}>
                                {exp.currency} {exp.amount.toLocaleString()}
                              </span>
                              <button
                                onClick={() => handleDeleteExpenseItem(exp._id)}
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", height: "fit-content" }}>
                      <h4 style={{ color: "var(--gold-primary)", marginBottom: "1rem", fontSize: "0.95rem" }}>Expense Category Breakdown</h4>
                      <div style={{ width: "100%", height: "200px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenses.reduce((acc, exp) => {
                                const cat = exp.category || "Other";
                                const existing = acc.find(item => item.name === cat);
                                if (existing) {
                                  existing.value += exp.amount;
                                } else {
                                  acc.push({ name: cat, value: exp.amount });
                                }
                                return acc;
                              }, [])}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {expenses.reduce((acc, exp) => {
                                const cat = exp.category || "Other";
                                if (!acc.includes(cat)) acc.push(cat);
                                return acc;
                              }, []).map((entry, index) => {
                                const COLORS = ["#d4af37", "#f39c12", "#2ecc71", "#e74c3c", "#3498db", "#9b59b6", "#1abc9c"];
                                return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                              })}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", width: "100%", marginTop: "1rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1rem" }}>
                        {expenses.reduce((acc, exp) => {
                          const cat = exp.category || "Other";
                          const existing = acc.find(item => item.name === cat);
                          if (existing) {
                            existing.value += exp.amount;
                          } else {
                            acc.push({ name: cat, value: exp.amount });
                          }
                          return acc;
                        }, []).map((entry, idx) => {
                          const COLORS = ["#d4af37", "#f39c12", "#2ecc71", "#e74c3c", "#3498db", "#9b59b6", "#1abc9c"];
                          return (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: COLORS[idx % COLORS.length] }}></span>
                                <span style={{ color: "var(--text-secondary)" }}>{entry.name}</span>
                              </div>
                              <span style={{ fontWeight: "700" }}>₹{entry.value.toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "checklist" && (
              <div className="animate-fade">
                <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3>Packing Checklist</h3>
                  <button onClick={() => setIsChecklistModalOpen(true)} className="btn-gold">
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                {(checklist || []).length === 0 ? (
                  <EmptyState title="Nothing to Pack" message="Add items to pack for the trip so you never forget essentials." />
                ) : (
                  <div className="glass-card">
                    {checklist.map((item) => (
                      <div key={item._id} className="packing-row">
                        <div className="packing-info">
                          <button
                            onClick={() => handleToggleChecklist(item._id, item.isPacked)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: item.isPacked ? "var(--gold-primary)" : "var(--text-muted)",
                              display: "flex",
                              alignItems: "center"
                            }}
                          >
                            <CheckSquare size={20} style={{ color: item.isPacked ? "var(--gold-primary)" : "var(--text-muted)" }} />
                          </button>
                          <div>
                            <span className={`packing-title ${item.isPacked ? "packed" : ""}`} style={{ fontSize: "0.95rem" }}>
                              {item.itemName} ({item.quantity}x)
                            </span>
                            <div style={{ display: "flex", gap: "0.5rem", fontSize: "0.7rem", marginTop: "0.15rem" }}>
                              <span style={{ color: "var(--text-muted)", textTransform: "uppercase" }}>{item.category}</span>
                              <span>•</span>
                              <span style={{
                                color: item.priority === "High" ? "var(--error)" : item.priority === "Medium" ? "var(--pending)" : "var(--text-muted)"
                              }}>
                                {item.priority} Priority
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteChecklistItem(item._id)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "documents" && (
              <div className="animate-fade">
                <h3>Travel Document Vault</h3>

                {/* Upload Section */}
                <form onSubmit={handleUploadDocument} className="glass-card" style={{ margin: "1.5rem 0" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <Input
                      label="Document Name"
                      id="docTitle"
                      value={docUpload.title}
                      onChange={(e) => setDocUpload({ ...docUpload, title: e.target.value })}
                      placeholder="e.g. Passport Copy"
                      required
                    />

                    <div className="form-group">
                      <label htmlFor="docType" className="form-label">Category Type</label>
                      <select
                        id="docType"
                        value={docUpload.docType}
                        onChange={(e) => setDocUpload({ ...docUpload, docType: e.target.value })}
                        className="form-input"
                      >
                        <option value="Passport">Passport</option>
                        <option value="Visa">Visa</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Flight Tickets">Flight Tickets</option>
                        <option value="Hotel Booking">Hotel Booking</option>
                        <option value="Rail Pass">Rail Pass</option>
                        <option value="Driving License">Driving License</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="upload-dropzone" onClick={() => document.getElementById("fileInput").click()}>
                    <UploadCloud size={32} style={{ color: "var(--gold-primary)", marginBottom: "0.5rem" }} />
                    <p style={{ fontSize: "0.85rem" }}>
                      {docUpload.file ? `Selected file: ${docUpload.file.name}` : "Click here to choose file (PDF, JPG, PNG, WEBP)"}
                    </p>
                    <input
                      id="fileInput"
                      type="file"
                      style={{ display: "none" }}
                      onChange={(e) => setDocUpload({ ...docUpload, file: e.target.files[0] })}
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "end" }}>
                    <Button type="submit" disabled={uploadingDoc || !docUpload.file || !docUpload.title}>
                      {uploadingDoc ? "Uploading..." : "Save & Vault"}
                    </Button>
                  </div>
                </form>

                {/* Uploaded Documents List */}
                {(documents || []).length === 0 ? (
                  <EmptyState title="No Documents Vaulted" message="Upload visa PDFs, flight tickets, and passports securely." />
                ) : (
                  <div className="doc-grid">
                    {documents.map((doc) => (
                      <div key={doc._id} className="glass-card doc-card">
                        <div>
                          <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(212,175,55,0.08)", color: "var(--gold-primary)", padding: "2px 6px", borderRadius: "4px" }}>
                            {doc.docType}
                          </span>
                          <h4 style={{ fontSize: "0.95rem", textTransform: "none", marginTop: "0.5rem" }}>{doc.title}</h4>
                        </div>

                        <div style={{ display: "flex", justifyContent: "between", alignItems: "center" }}>
                          <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: "4px 8px", fontSize: "0.75rem" }}>
                            <Eye size={12} /> View File
                          </a>
                          <button
                            onClick={() => handleDeleteDocumentItem(doc._id)}
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "suggestions" && (
              <div className="animate-fade">
                <h3>Hotel & Destination Recommendations</h3>
                <div className="glass-card" style={{ marginTop: "1.5rem", whiteSpace: "pre-line" }}>
                  <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
                    <BookOpen size={20} style={{ color: "var(--gold-primary)" }} />
                    <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Planner Advice Book</span>
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: "1.8" }}>
                    {trip.notes || "No recommendations or planning notes saved for this trip yet."}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "photos" && (
              <div className="animate-fade">
                <div style={{ display: "flex", justifyContent: "between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <h3>Trip Photo Gallery</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Every picture uploaded is saved inside your private travel vault.
                    </p>
                  </div>
                  
                  <div>
                    <button 
                      onClick={() => document.getElementById("galleryUploadInput").click()}
                      className="btn-gold"
                      style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}
                    >
                      <UploadCloud size={16} /> Upload Photo
                    </button>
                    <input
                      id="galleryUploadInput"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (!file.type.startsWith("image/")) {
                            alert("Only image files are allowed");
                            return;
                          }
                          const formData = new FormData();
                          formData.append("image", file);
                          try {
                            setLoading(true);
                            const res = await uploadTripPhoto(trip._id, formData);
                            if (res.data.success) {
                              setTrip(res.data.trip);
                            }
                          } catch (err) {
                            alert("Photo upload failed");
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div 
                  className={`upload-dropzone ${dragging ? "dragging" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: "2px dashed var(--gold-border)",
                    borderRadius: "8px",
                    padding: "2rem",
                    textAlign: "center",
                    cursor: "pointer",
                    background: dragging ? "rgba(212, 175, 55, 0.05)" : "rgba(255, 255, 255, 0.01)",
                    borderColor: dragging ? "var(--gold-primary)" : "var(--gold-border)",
                    marginBottom: "1.5rem",
                    transition: "all var(--transition-fast)"
                  }}
                  onClick={() => document.getElementById("galleryUploadInput").click()}
                >
                  <UploadCloud size={32} style={{ color: "var(--gold-primary)", marginBottom: "0.5rem" }} />
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Drag and drop travel memories here or click to browse files
                  </p>
                </div>

                {(trip.photos || []).length === 0 ? (
                  <div 
                    className="glass-card animate-fade" 
                    style={{ padding: "4rem 2rem", textAlign: "center", border: "1px dashed var(--gold-border)" }}
                  >
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                      No photos uploaded for this trip yet. Document your elite memories!
                    </p>
                    <button
                      onClick={() => document.getElementById("galleryUploadInput").click()}
                      className="btn-outline"
                      style={{ fontSize: "0.85rem" }}
                    >
                      Choose Photo to Upload
                    </button>
                  </div>
                ) : (
                  <div 
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                      gap: "1.25rem",
                      marginTop: "1.5rem"
                    }}
                  >
                    {trip.photos.map((photo, index) => (
                      <div 
                        key={index}
                        className="glass-card animate-slide"
                        style={{
                          padding: "0",
                          height: "200px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid var(--gold-border)",
                          position: "relative",
                          cursor: "zoom-in"
                        }}
                        onClick={() => setLightboxIndex(index)}
                      >
                        <img 
                          src={photo} 
                          alt={`Trip ${index + 1}`} 
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform var(--transition-normal)"
                          }}
                          className="gallery-grid-img"
                        />
                        {trip.coverImage === photo && (
                          <span 
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              backgroundColor: "var(--gold-primary)",
                              color: "#050505",
                              fontSize: "0.65rem",
                              fontWeight: "800",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                            }}
                          >
                            Cover
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lightbox Carousel Modal Overlay */}
            {lightboxIndex > -1 && (
              <div 
                style={{
                  position: "fixed",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: "rgba(5, 5, 5, 0.95)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column"
                }}
                onClick={() => setLightboxIndex(-1)}
              >
                <button
                  style={{
                    position: "absolute", top: "20px", right: "20px",
                    background: "none", border: "none", color: "#fff",
                    cursor: "pointer"
                  }}
                  onClick={() => setLightboxIndex(-1)}
                >
                  <X size={32} />
                </button>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "80%" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff", borderRadius: "50%", padding: "12px", cursor: "pointer",
                      marginRight: "2rem", display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                    onClick={handlePrevPhoto}
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <img 
                    src={trip.photos[lightboxIndex]} 
                    alt={`Photo ${lightboxIndex + 1}`}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "70%",
                      objectFit: "contain",
                      borderRadius: "8px",
                      border: "1px solid var(--gold-border)",
                      boxShadow: "0 0 30px var(--gold-glow)"
                    }}
                  />

                  <button
                    style={{
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "#fff", borderRadius: "50%", padding: "12px", cursor: "pointer",
                      marginLeft: "2rem", display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                    onClick={handleNextPhoto}
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                <div style={{ marginTop: "1rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                  Photo {lightboxIndex + 1} of {trip.photos.length}
                </div>
              </div>
            )}

            {/* Modals */}
            {/* Modal: Activity */}
            <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="Log Itinerary Activity">
              <form onSubmit={handleAddActivity}>
                <div className="form-group">
                  <label htmlFor="itinerarySelect" className="form-label">Day Schedule</label>
                  <select
                    id="itinerarySelect"
                    value={newActivity.itineraryId}
                    onChange={(e) => setNewActivity({ ...newActivity, itineraryId: e.target.value })}
                    className="form-input"
                    required
                  >
                    {itineraries.map((day) => (
                      <option key={day._id} value={day._id}>
                        Day {day.dayNumber} - {new Date(day.date).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Activity Time"
                  id="actTime"
                  value={newActivity.time}
                  onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                  placeholder="e.g. 09:00 AM"
                  required
                />

                <Input
                  label="Activity Title"
                  id="actTitle"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="e.g. Panoramic Train Ride"
                  required
                />

                <Input
                  label="Location (Optional)"
                  id="actLocation"
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                  placeholder="e.g. Lucerne Hauptbahnhof"
                />

                <div className="form-group">
                  <label htmlFor="actDesc" className="form-label">Description (Optional)</label>
                  <textarea
                    id="actDesc"
                    value={newActivity.description}
                    onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                    className="form-input"
                    style={{ height: "70px", resize: "vertical" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "end", gap: "1rem", marginTop: "1rem" }}>
                  <Button variant="outline" onClick={() => setIsActivityModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Activity</Button>
                </div>
              </form>
            </Modal>

            {/* Modal: Expense */}
            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log Outflow Expense">
              <form onSubmit={handleAddExpense}>
                <Input
                  label="Expense Title"
                  id="expTitle"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="e.g. Luxury Dinner reservation"
                  required
                />

                <Input
                  label="Amount (INR)"
                  id="expAmount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="12000"
                  required
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div className="form-group">
                    <label htmlFor="expCat" className="form-label">Category</label>
                    <select
                      id="expCat"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="form-input"
                    >
                      <option value="Flight">Flight</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Activity">Activity</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="expPay" className="form-label">Payment Method</label>
                    <select
                      id="expPay"
                      value={newExpense.paymentMethod}
                      onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                      className="form-input"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "end", gap: "1rem", marginTop: "1rem" }}>
                  <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Expense</Button>
                </div>
              </form>
            </Modal>

            {/* Modal: Packing Item */}
            <Modal isOpen={isChecklistModalOpen} onClose={() => setIsChecklistModalOpen(false)} title="Log Checklist Item">
              <form onSubmit={handleAddChecklist}>
                <Input
                  label="Item Name"
                  id="packItem"
                  value={newChecklist.itemName}
                  onChange={(e) => setNewChecklist({ ...newChecklist, itemName: e.target.value })}
                  placeholder="e.g. Adapters Type J"
                  required
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Input
                    label="Quantity"
                    id="packQty"
                    type="number"
                    value={newChecklist.quantity}
                    onChange={(e) => setNewChecklist({ ...newChecklist, quantity: e.target.value })}
                    required
                  />

                  <div className="form-group">
                    <label htmlFor="packPriority" className="form-label">Priority</label>
                    <select
                      id="packPriority"
                      value={newChecklist.priority}
                      onChange={(e) => setNewChecklist({ ...newChecklist, priority: e.target.value })}
                      className="form-input"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Category (Optional)"
                  id="packCat"
                  value={newChecklist.category}
                  onChange={(e) => setNewChecklist({ ...newChecklist, category: e.target.value })}
                  placeholder="e.g. Clothing, Electronics"
                />

                <div style={{ display: "flex", justifyContent: "end", gap: "1rem", marginTop: "1rem" }}>
                  <Button variant="outline" onClick={() => setIsChecklistModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Item</Button>
                </div>
              </form>
            </Modal>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TripDetails;
