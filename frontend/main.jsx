import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

console.log("TRIPVAULT: main.jsx is executing...");

// Import Styles in cascade order
import "./styles/globals.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/responsive.css";

// Register Service Worker for PWA Support
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => console.log("[TripVault PWA] Service Worker registered:", reg.scope))
      .catch((err) => console.error("[TripVault PWA] Registration failed:", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
