import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

console.log("TRIPVAULT: main.jsx is executing...");

// Import Styles in cascade order
import "./styles/globals.css";
import "./styles/components.css";
import "./styles/pages.css";
import "./styles/responsive.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
