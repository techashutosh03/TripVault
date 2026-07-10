import Itinerary from "../models/Itinerary.js";

// ============================================
// Create Itinerary Day
// ============================================
export const createItinerary = async (req, res) => {
  try {
    const { dayNumber, date, activities } = req.body;

    const itinerary = await Itinerary.create({
      tripId: req.params.tripId,
      dayNumber,
      date,
      activities,
    });

    res.status(201).json({
      success: true,
      message: "Itinerary created successfully",
      itinerary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ============================================
// Get Trip Itinerary
// ============================================
export const getTripItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.find({
      tripId: req.params.tripId,
    }).sort({ dayNumber: 1 });

    res.status(200).json({
      success: true,
      count: itinerary.length,
      itinerary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ============================================
// Update Itinerary
// ============================================
export const updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Itinerary updated successfully",
      itinerary,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
// ============================================
// Delete Itinerary
// ============================================
export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: "Itinerary not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Itinerary deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};