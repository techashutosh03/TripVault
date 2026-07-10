import express from "express";
import {
  createChecklistItem,
  getChecklistByTrip,
  updateChecklistItem,
  deleteChecklistItem,
} from "../controllers/packingController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply auth middleware to all checklist routes
router.use(authMiddleware);

router.post("/", createChecklistItem);
router.get("/trip/:tripId", getChecklistByTrip);
router.put("/:id", updateChecklistItem);
router.delete("/:id", deleteChecklistItem);

export default router;
