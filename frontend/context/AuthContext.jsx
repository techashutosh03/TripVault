import React, { createContext, useState, useEffect, useContext } from "react";
import API from "../services/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("tripvault_token"));
  const [loading, setLoading] = useState(true);

  // Validate session on load
  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await API.get("/profile");
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.success) {
        localStorage.setItem("tripvault_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login Failed",
      };
    }
  };

  const register = async (fullName, email, password) => {
    try {
      const res = await API.post("/auth/register", { fullName, email, password });
      if (res.data.success) {
        localStorage.setItem("tripvault_token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration Failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("tripvault_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
