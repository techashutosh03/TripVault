import express from "express";
import { getWeather } from "../controllers/weatherController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all weather routes
router.use(authMiddleware);

router.get("/", getWeather);

export default router;
