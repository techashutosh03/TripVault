import express from "express";
import { getPublicProfile, updateProfile } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET public user profile
router.get("/:username/profile", getPublicProfile);

// PUT update logged-in user profile
router.put("/profile", authMiddleware, updateProfile);

export default router;
