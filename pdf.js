import express from "express";
import { generateTripPDF } from "../controllers/pdfController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all PDF routes
router.use(authMiddleware);

router.get("/trip/:tripId", generateTripPDF);

export default router;
