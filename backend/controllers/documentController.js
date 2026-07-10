import TravelDocument from "../models/TravelDocument.js";
import Trip from "../models/Trip.js";
import cloudinary from "../config/cloudinary.js";

// ============================================
// Upload Document
// ============================================
export const uploadDocument = async (req, res) => {
  try {
    const { tripId, docType, title } = req.body;

    if (!tripId || !docType || !title) {
      return res.status(400).json({
        success: false,
        message: "tripId, docType, and title are required fields",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No document file uploaded",
      });
    }

    // Verify trip exists and belongs to logged-in user
    const trip = await Trip.findOne({ _id: tripId, createdBy: req.user.id });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or unauthorized",
      });
    }

    // Extract Cloudinary properties
    const fileUrl = req.file.path;
    const fileId = req.file.filename || req.file.public_id || "unknown_id";

    const document = await TravelDocument.create({
      tripId,
      docType,
      title,
      fileUrl,
      fileId,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded and saved successfully",
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Get Documents for a Trip
// ============================================
export const getDocumentsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify trip exists and belongs to logged-in user
    const trip = await Trip.findOne({ _id: tripId, createdBy: req.user.id });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found or unauthorized",
      });
    }

    const documents = await TravelDocument.find({ tripId, createdBy: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Delete Document
// ============================================
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await TravelDocument.findOne({ _id: id, createdBy: req.user.id });
    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found or unauthorized",
      });
    }

    // Delete from Cloudinary if valid public ID exists
    if (document.fileId && document.fileId !== "unknown_id") {
      try {
        await cloudinary.uploader.destroy(document.fileId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion failed for publicId:", document.fileId, cloudinaryError);
        // Continue database deletion anyway
      }
    }

    await TravelDocument.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
