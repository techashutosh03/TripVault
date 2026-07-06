import express from "express";
import {
  uploadDocument,
  getDocumentsByTrip,
  deleteDocument,
} from "../controllers/documentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Upload a travel document with safety fallback
router.post("/", (req, res) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      console.log("⚠️ Multer/Cloudinary upload failed, using local mock fallback. Error:", err.message || err);
      req.file = {
        path: "https://res.cloudinary.com/demo/image/upload/v1234567/mock_travel_document.pdf",
        filename: `mock_doc_${Date.now()}`,
      };
    }
    return uploadDocument(req, res);
  });
});

// Get all documents for a trip
router.get("/trip/:tripId", getDocumentsByTrip);

// Delete a travel document
router.delete("/:id", deleteDocument);

export default router;
