import React from "react";

const Button = ({ children, onClick, type = "button", variant = "gold", className = "", ...props }) => {
  const btnClass = variant === "gold" ? "btn-gold" : "btn-outline";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${btnClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
