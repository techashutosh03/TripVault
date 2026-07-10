import express from "express";
import {
  createTrip,
  getTrips,
  getSingleTrip,
  updateTrip,
  deleteTrip,
} from "../controllers/tripController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Trip
router.post("/", authMiddleware, createTrip);

// Get All Trips
router.get("/", authMiddleware, getTrips);

// Get Single Trip
router.get("/:id", authMiddleware, getSingleTrip);

// Update Trip
router.put("/:id", authMiddleware, updateTrip);

// Delete Trip
router.delete("/:id", authMiddleware, deleteTrip);

export default router;
