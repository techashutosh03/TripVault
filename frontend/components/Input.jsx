import React from "react";

const Input = ({ label, id, type = "text", value, onChange, placeholder = "", required = false, ...props }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="form-input"
        {...props}
      />
    </div>
  );
};

export default Input;
