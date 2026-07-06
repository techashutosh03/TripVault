import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, IndianRupee, ArrowRight, Edit2 } from "lucide-react";
import { getDestinationImage, getDestinationFlag, calculateDuration } from "../services/travelHelpers.js";

const TripCard = ({ trip }) => {
  const coverImage = trip.coverImage || getDestinationImage(trip.destination);
  const flag = getDestinationFlag(trip.destination);
  const duration = calculateDuration(trip.startDate, trip.endDate);
  
  // Deterministic stable mock progress based on trip ID for card grid
  const progressPercentage = trip.planningProgress || (Math.abs(trip._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) * 7) % 31) + 60;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  const formatYear = (dateStr) => {
    return new Date(dateStr).getFullYear();
  };

  return (
    <div className="glass-card trip-card animate-slide" style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "440px",
      padding: "0",
      overflow: "hidden",
      border: "1px solid var(--gold-border)",
      transition: "all var(--transition-normal)"
    }}>
      {/* Hero Image Container */}
      <div style={{ position: "relative", height: "180px", width: "100%", overflow: "hidden" }}>
        <img
          src={coverImage}
          alt={trip.destination}
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

        {/* Duration Badge */}
        <span style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          backgroundColor: "rgba(212, 175, 55, 0.95)",
          color: "#000",
          fontSize: "0.75rem",
          fontWeight: "700",
          padding: "0.25rem 0.6rem",
          borderRadius: "4px",
          letterSpacing: "0.05em",
          textTransform: "uppercase"
        }}>
          {duration}
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
            letterSpacing: "0.1em"
          }}>
            {trip.destination}
          </span>
        </div>
      </div>

      {/* Card Details Body */}
      <div style={{ padding: "1.25rem", flex: "1", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h3 style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            textTransform: "none",
            letterSpacing: "0",
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
            lineHeight: "1.3",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }}>
            {trip.title}
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            <div className="trip-card-meta" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <Calendar size={14} style={{ color: "var(--gold-primary)" }} />
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}, {formatYear(trip.startDate)}
              </span>
            </div>

            <div className="trip-card-meta" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <Users size={14} style={{ color: "var(--gold-primary)" }} />
              <span>
                {trip.travelers} {trip.travelers > 1 ? "Travelers" : "Traveler"}
              </span>
            </div>

            <div className="trip-card-meta" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <IndianRupee size={14} style={{ color: "var(--gold-primary)" }} />
              <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>
                ₹{trip.budget.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Planning Progress Bar */}
        <div style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", marginBottom: "0.35rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Planning Completeness</span>
            <span style={{ color: "var(--gold-primary)", fontWeight: "700" }}>{progressPercentage}%</span>
          </div>
          <div style={{
            height: "5px",
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: "10px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${progressPercentage}%`,
              height: "100%",
              background: "linear-gradient(to right, var(--gold-primary), var(--gold-hover))",
              borderRadius: "10px",
              boxShadow: "0 0 8px var(--gold-primary)"
            }}></div>
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div style={{
        padding: "0 1.25rem 1.25rem 1.25rem",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: "0.75rem"
      }}>
        <Link
          to={`/trips/${trip._id}`}
          className="btn-gold"
          style={{
            justifyContent: "center",
            fontSize: "0.8rem",
            padding: "0.6rem 1rem"
          }}
        >
          Explore Vault <ArrowRight size={14} />
        </Link>
        <Link
          to={`/trips/${trip._id}/edit`}
          className="btn-outline"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.6rem",
            borderRadius: "8px"
          }}
          title="Edit Trip Settings"
        >
          <Edit2 size={14} />
        </Link>
      </div>
    </div>
  );
};

export default TripCard;
