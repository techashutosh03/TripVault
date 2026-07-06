import express from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all analytics routes
router.use(authMiddleware);

router.get("/", getDashboardAnalytics);

export default router;
