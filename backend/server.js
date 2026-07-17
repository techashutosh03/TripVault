import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

// ============================================
// Routes
// ============================================
import authRoutes from "./routes/auth.js";
import tripRoutes from "./routes/trip.js";
import uploadRoutes from "./routes/upload.js";
import itineraryRoutes from "./routes/itinerary.js";
import expenseRoutes from "./routes/expense.js";
import packingRoutes from "./routes/packing.js";
import documentRoutes from "./routes/document.js";
import analyticsRoutes from "./routes/analytics.js";
import notificationRoutes from "./routes/notification.js";
import weatherRoutes from "./routes/weather.js";
import mapsRoutes from "./routes/maps.js";
import currencyRoutes from "./routes/currency.js";
import aiRoutes from "./routes/ai.js";
import pdfRoutes from "./routes/pdf.js";
import userRoutes from "./routes/user.js";
import User from "./models/User.js";

// ============================================
// Middleware
// ============================================
import authMiddleware from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// ============================================
// Database
// ============================================
connectDB();

// ============================================
// Middlewares
// ============================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(morgan("dev"));

// ============================================
// Health Check
// ============================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 TripVault API Running",
    version: "1.0.0",
  });
});

// ============================================
// API Routes
// ============================================

// Authentication
app.use("/api/auth", authRoutes);

// Trips
app.use("/api/trips", tripRoutes);

// Upload
app.use("/api/upload", uploadRoutes);

// Itinerary
app.use("/api/itinerary", itineraryRoutes);

// Expenses
app.use("/api/expenses", expenseRoutes);

// Packing Checklist
app.use("/api/packing", packingRoutes);

// Travel Documents
app.use("/api/documents", documentRoutes);

// Analytics
app.use("/api/analytics", analyticsRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);

// Weather
app.use("/api/weather", weatherRoutes);

// Maps
app.use("/api/maps", mapsRoutes);

// Currency
app.use("/api/currency", currencyRoutes);

// AI Planner
app.use("/api/ai", aiRoutes);

// PDF Export
app.use("/api/pdf", pdfRoutes);

// Users Profile Routes
app.use("/api/users", userRoutes);

// Protected Profile Route
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Protected Route Accessed Successfully",
      user,
    });
  } catch (error) {
    console.error("Error in /api/profile:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});