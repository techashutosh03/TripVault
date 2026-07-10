import PackingChecklist from "../models/PackingChecklist.js";
import Trip from "../models/Trip.js";

// ============================================
// Create Packing Item
// ============================================
export const createChecklistItem = async (req, res) => {
  try {
    const { tripId, itemName, category, quantity, priority, notes, isPacked } = req.body;

    if (!tripId || !itemName) {
      return res.status(400).json({
        success: false,
        message: "tripId and itemName are required",
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

    const item = await PackingChecklist.create({
      tripId,
      itemName,
      category,
      quantity,
      priority,
      notes,
      isPacked: isPacked || false,
    });

    res.status(201).json({
      success: true,
      message: "Checklist item added successfully",
      item,
    });
  } catch (error) {
    console.error("Create packing item error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Get Checklist for a Trip
// ============================================
export const getChecklistByTrip = async (req, res) => {
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

    const checklist = await PackingChecklist.find({ tripId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: checklist.length,
      checklist,
    });
  } catch (error) {
    console.error("Get checklist error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Update Packing Item
// ============================================
export const updateChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find checklist item
    const item = await PackingChecklist.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Checklist item not found",
      });
    }

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: item.tripId, createdBy: req.user.id });
    if (!trip) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this checklist item",
      });
    }

    const updatedItem = await PackingChecklist.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Checklist item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update packing item error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Delete Packing Item
// ============================================
export const deleteChecklistItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find checklist item
    const item = await PackingChecklist.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Checklist item not found",
      });
    }

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: item.tripId, createdBy: req.user.id });
    if (!trip) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this checklist item",
      });
    }

    await PackingChecklist.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Checklist item deleted successfully",
    });
  } catch (error) {
    console.error("Delete packing item error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
