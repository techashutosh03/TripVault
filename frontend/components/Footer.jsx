import React from "react";

const Footer = () => {
  return (
    <footer style={{ 
      marginTop: "auto", 
      padding: "1.5rem 0", 
      textAlign: "center", 
      borderTop: "1px solid var(--glass-border)", 
      color: "var(--text-muted)", 
      fontSize: "0.8rem",
      width: "100%"
    }}>
      © {new Date().getFullYear()} TripVault Travel Planning Platform. All Rights Reserved.
    </footer>
  );
};

export default Footer;
