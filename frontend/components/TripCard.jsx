import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Edit2, Trash2, Star, MapPin, AlertTriangle } from "lucide-react";
import { getDestinationImage, getDestinationFlag } from "../services/travelHelpers.js";

const TripCard = ({ trip, onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const coverImage = trip.coverImage || getDestinationImage(trip.destination);
  const flag = getDestinationFlag(trip.destination);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const r = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          style={{
            color: i <= r ? "var(--gold-primary)" : "var(--text-muted)",
            fill: i <= r ? "var(--gold-primary)" : "none",
            marginRight: "2px",
          }}
        />
      );
    }
    return (
      <div style={{ display: "flex", alignItems: "center" }} title={`Rating: ${rating || 0}/5`}>
        {stars}
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginLeft: "0.5rem", fontWeight: "600" }}>
          ({rating || 0})
        </span>
      </div>
    );
  };

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(trip._id);
    }
    setShowConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div 
      className="glass-card trip-card animate-slide" 
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "380px",
        padding: "0",
        overflow: "hidden",
        border: "1px solid var(--gold-border)",
        borderRadius: "16px",
        transition: "all var(--transition-normal)",
        position: "relative"
      }}
    >
      {/* Delete Confirmation Overlay inside card */}
      {showConfirm && (
        <div style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          zIndex: "10",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center"
        }}>
          <AlertTriangle size={36} style={{ color: "var(--error)", marginBottom: "1rem" }} />
          <h4 style={{ color: "var(--text-primary)", marginBottom: "0.5rem", fontSize: "1.1rem" }}>Confirm Deletion</h4>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
            Are you sure you want to permanently delete this trip?
          </p>
          <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
            <button 
              onClick={handleCancelDelete} 
              className="btn-outline" 
              style={{ flex: "1", fontSize: "0.8rem", padding: "0.5rem" }}
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete} 
              className="btn-gold" 
              style={{ flex: "1", fontSize: "0.8rem", padding: "0.5rem", backgroundColor: "var(--error)", border: "1px solid var(--error)" }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* Hero Image Container */}
      <div style={{ position: "relative", height: "160px", width: "100%", overflow: "hidden" }}>
        <img
          src={coverImage}
          alt={trip.destination}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform var(--transition-normal)"
          }}
          className="trip-card-hero-img"
        />
        <div style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(5,5,5,0.85) 100%)"
        }} />
        
        {/* Country Flag Overlay */}
        <span style={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          fontSize: "1.8rem",
          filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
        }} title={trip.destination}>
          {flag}
        </span>

        {/* Destination Text Overlay */}
        <div style={{
          position: "absolute",
          bottom: "0.5rem",
          left: "1.25rem"
        }}>
          <span style={{
            fontSize: "0.75rem",
            color: "var(--gold-primary)",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            <MapPin size={12} /> {trip.destination}
          </span>
        </div>
      </div>

      {/* Card Details Body */}
      <div style={{ padding: "1.25rem", flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              textTransform: "none",
              letterSpacing: "0",
              color: "var(--text-primary)",
              marginBottom: "0.25rem",
              lineHeight: "1.3",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            title={trip.title}
          >
            {trip.title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            <Calendar size={14} style={{ color: "var(--gold-primary)" }} />
            <span>
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>

          {trip.description && (
            <p style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              lineHeight: "1.4",
              marginTop: "0.25rem",
              display: "-webkit-box",
              WebkitLineClamp: "2",
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {trip.description}
            </p>
          )}
        </div>

        {/* Rating Section */}
        <div style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
          {renderStars(trip.rating)}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div 
        style={{
          padding: "0 1.25rem 1.25rem 1.25rem",
          display: "flex",
          gap: "0.75rem"
        }}
      >
        <Link
          to={`/trips/${trip._id}/edit`}
          className="btn-gold"
          style={{
            flex: "1",
            justifyContent: "center",
            fontSize: "0.8rem",
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem"
          }}
        >
          <Edit2 size={13} /> Edit
        </Link>
        <button
          onClick={handleDeleteClick}
          className="btn-outline"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5rem",
            borderRadius: "8px",
            borderColor: "rgba(231, 76, 60, 0.3)",
            color: "var(--error)"
          }}
          title="Delete Trip"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default TripCard;
