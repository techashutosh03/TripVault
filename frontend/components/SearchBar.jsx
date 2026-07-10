import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "350px" }}>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="form-input"
        style={{ paddingLeft: "2.5rem" }}
      />
      <Search
        size={16}
        style={{
          position: "absolute",
          left: "0.85rem",
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-secondary)",
        }}
      />
    </div>
  );
};

export default SearchBar;
