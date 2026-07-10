import React from "react";
import Button from "./Button.jsx";

const EmptyState = ({ icon: Icon, title, message, actionText, onAction }) => {
  return (
    <div className="glass-card animate-fade" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "3rem 2rem",
      margin: "1.5rem 0",
      gap: "1rem"
    }}>
      {Icon && (
        <div style={{
          backgroundColor: "rgba(212, 175, 55, 0.05)",
          border: "1px solid var(--gold-border)",
          padding: "1rem",
          borderRadius: "50%",
          color: "var(--gold-primary)",
          marginBottom: "0.5rem"
        }}>
          <Icon size={32} />
        </div>
      )}
      <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>{title}</h3>
      <p style={{ maxWidth: "400px", fontSize: "0.9rem" }}>{message}</p>
      {actionText && onAction && (
        <Button onClick={onAction} style={{ marginTop: "0.5rem" }}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
