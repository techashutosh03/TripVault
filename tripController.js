import Trip from "../models/Trip.js";

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
