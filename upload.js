import express from "express";
import upload from "../middleware/upload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  uploadImage
);

export default router;