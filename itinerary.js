import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createItinerary,
  getTripItinerary,
  updateItinerary,
  deleteItinerary,
} from "../controllers/itineraryController.js";

const router = express.Router();

// Create itinerary for a trip
router.post("/:tripId", authMiddleware, createItinerary);

// Get itinerary of a trip
router.get("/:tripId", authMiddleware, getTripItinerary);

// Update itinerary day
router.put("/:id", authMiddleware, updateItinerary);

// Delete itinerary day
router.delete("/:id", authMiddleware, deleteItinerary);

export default router;