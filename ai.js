import express from "express";
import { planTrip } from "../controllers/aiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(authMiddleware);

router.post("/plan", planTrip);

export default router;
