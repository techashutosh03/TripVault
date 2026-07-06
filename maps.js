import express from "express";
import { getPlaces, getNearby } from "../controllers/mapsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all maps routes
router.use(authMiddleware);

router.get("/places", getPlaces);
router.get("/nearby", getNearby);

export default router;
