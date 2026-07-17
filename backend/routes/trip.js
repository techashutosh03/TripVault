import express from "express";
import {
  createTrip,
  getTrips,
  getSingleTrip,
  updateTrip,
  deleteTrip,
  uploadTripPhoto,
} from "../controllers/tripController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

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

// Upload Trip Photo
router.post("/:id/upload", authMiddleware, upload.single("image"), uploadTripPhoto);

export default router;