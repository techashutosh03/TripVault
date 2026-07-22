import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages Imports
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyTrips from "./pages/MyTrips.jsx";
import CreateTrip from "./pages/CreateTrip.jsx";
import EditTrip from "./pages/EditTrip.jsx";
import TripDetails from "./pages/TripDetails.jsx";
import AIChat from "./pages/AIChat.jsx";
import Weather from "./pages/Weather.jsx";
import Maps from "./pages/Maps.jsx";
import Currency from "./pages/Currency.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Analytics from "./pages/Analytics.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  console.log("TRIPVAULT: App component is rendering...");
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:username" element={<PublicProfile />} />

          {/* Protected Vault Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/create" element={<CreateTrip />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/trips/:id/edit" element={<EditTrip />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/maps" element={<Maps />} />
            <Route path="/currency" element={<Currency />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
