import React from "react";

const StatCard = ({ label, value, icon: Icon, color = "gold" }) => {
  return (
    <div className="glass-card stat-card animate-slide">
      <div>
        <span className="stat-label">{label}</span>
        <div className={`stat-val ${color}`}>{value}</div>
      </div>
      {Icon && (
        <div className="stat-icon">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
