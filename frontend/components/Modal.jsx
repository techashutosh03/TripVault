import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-card modal-content animate-slide" 
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer"
          }}
        >
          <X size={18} />
        </button>

        {title && (
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1.5rem", borderLeft: "3px solid var(--gold-primary)", paddingLeft: "0.5rem" }}>
            {title}
          </h2>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
