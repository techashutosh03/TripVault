import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
});

// Automatically inject JWT token from localStorage into Authorization headers
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tripvault_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
