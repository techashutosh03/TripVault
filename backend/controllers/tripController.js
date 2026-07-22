import Trip from "../models/Trip.js";
import User from "../models/User.js";
import QRCode from "qrcode";

// ============================================
// Create Trip
// ============================================
export const createTrip = async (req, res) => {
  try {
    const {
      title,
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      notes,
      description,
      rating,
      coverImage,
    } = req.body;

    // Validation
    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (title, destination, startDate, endDate)",
      });
    }

    const trip = await Trip.create({
      title,
      destination,
      startDate,
      endDate,
      budget: budget !== undefined ? Number(budget) : 0,
      travelers: travelers !== undefined ? Number(travelers) : 1,
      notes: notes || description || "",
      description: description || notes || "",
      rating: rating !== undefined ? Number(rating) : 0,
      coverImage,
      user: req.user.id,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Error in createTrip:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
};

// ============================================
// Get All Trips
// ============================================
export const getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Error in getTrips:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Get Single Trip
// ============================================
export const getSingleTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Verify ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error("Error in getSingleTrip:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Update Trip
// ============================================
export const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Verify ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updates = { ...req.body };
    if (updates.description && !updates.notes) updates.notes = updates.description;
    if (updates.notes && !updates.description) updates.description = updates.notes;

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Error in updateTrip:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Delete Trip
// ============================================
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Verify ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteTrip:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Upload Trip Photo
// ============================================
export const uploadTripPhoto = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    // Verify ownership
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const imageUrl = req.file.path;

    // Append to photos array
    trip.photos.push(imageUrl);

    // If first uploaded image, set it as coverImage
    if (!trip.coverImage) {
      trip.coverImage = imageUrl;
    }

    await trip.save();

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      coverImage: trip.coverImage,
      photos: trip.photos,
      trip,
    });
  } catch (error) {
    console.error("Error in uploadTripPhoto:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error during photo upload",
    });
  }
};

// ============================================
// QR Code Generator Controller
// ============================================
export const getTripQRCode = async (req, res) => {
  try {
    const { id } = req.params;
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5180";
    const shareUrl = `${frontendUrl}/trips/${id}`;
    
    // Generate QR Code data URL
    const qrDataUrl = await QRCode.toDataURL(shareUrl, {
      color: {
        dark: "#d4af37", // Gold
        light: "#0d0d0d"  // Dark charcoal background
      },
      width: 250,
      margin: 2
    });

    res.status(200).json({
      success: true,
      qrCode: qrDataUrl,
      shareUrl
    });
  } catch (error) {
    console.error("QR Code Generation Error:", error);
    res.status(500).json({ success: false, message: "Failed to generate QR Code" });
  }
};

// ============================================
// Toggle Like on Trip
// ============================================
export const toggleLikeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const likeIndex = trip.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Unlike
      trip.likes.splice(likeIndex, 1);
    } else {
      // Like
      trip.likes.push(userId);
    }

    await trip.save();
    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? "Trip unliked" : "Trip liked",
      likes: trip.likes
    });
  } catch (error) {
    console.error("Like toggle error:", error);
    res.status(500).json({ success: false, message: "Server Error during like toggle" });
  }
};

// ============================================
// Add Comment on Trip
// ============================================
export const addCommentTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text cannot be empty" });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const user = await User.findById(userId);

    const comment = {
      user: userId,
      username: user.username || user.fullName,
      text: text.trim(),
      createdAt: new Date()
    };

    trip.comments.push(comment);
    await trip.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comments: trip.comments
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ success: false, message: "Server Error during comment addition" });
  }
};