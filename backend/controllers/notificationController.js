import Notification from "../models/Notification.js";
import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";
import TravelDocument from "../models/TravelDocument.js";

// ============================================
// Get Notifications & Auto-Generate Reminders
// ============================================
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    // 1. Fetch upcoming trips starting in the next 3 days
    const upcomingTrips = await Trip.find({
      createdBy: userId,
      startDate: { $gte: now, $lte: threeDaysFromNow },
    });

    // 2. Auto-generate reminders dynamically if they don't already exist
    for (const trip of upcomingTrips) {
      // A. Travel Reminder
      const travelRemKey = `Travel_Reminder_${trip._id}`;
      const existingTravelRem = await Notification.findOne({
        userId,
        message: { $regex: trip._id.toString() },
        type: "Travel",
      });

      if (!existingTravelRem) {
        await Notification.create({
          userId,
          title: `Upcoming Trip: ${trip.title}`,
          message: `Your trip to ${trip.destination} is starting soon on ${new Date(
            trip.startDate
          ).toLocaleDateString()}. (Trip ID: ${trip._id})`,
          type: "Travel",
        });
      }

      // B. Flight Reminder (if flight expenses exist)
      const hasFlightExpense = await Expense.exists({ tripId: trip._id, category: "Flight" });
      if (hasFlightExpense) {
        const existingFlightRem = await Notification.findOne({
          userId,
          message: { $regex: trip._id.toString() },
          type: "Flight",
        });

        if (!existingFlightRem) {
          await Notification.create({
            userId,
            title: `Flight Reminder: ${trip.title}`,
            message: `Don't forget to check in for your flight to ${trip.destination}! (Trip ID: ${trip._id})`,
            type: "Flight",
          });
        }
      }

      // C. Hotel Check-in Reminder (if hotel expenses exist)
      const hasHotelExpense = await Expense.exists({ tripId: trip._id, category: "Hotel" });
      if (hasHotelExpense) {
        const existingHotelRem = await Notification.findOne({
          userId,
          message: { $regex: trip._id.toString() },
          type: "Hotel",
        });

        if (!existingHotelRem) {
          await Notification.create({
            userId,
            title: `Hotel Check-in: ${trip.title}`,
            message: `Reminder for your upcoming hotel check-in at ${trip.destination}. (Trip ID: ${trip._id})`,
            type: "Hotel",
          });
        }
      }

      // D. Visa Expiry Reminder (if Visa travel doc uploaded)
      const hasVisaDoc = await TravelDocument.exists({ tripId: trip._id, docType: "Visa" });
      if (hasVisaDoc) {
        const existingVisaRem = await Notification.findOne({
          userId,
          message: { $regex: trip._id.toString() },
          type: "Visa",
        });

        if (!existingVisaRem) {
          await Notification.create({
            userId,
            title: `Visa Expiry Check: ${trip.title}`,
            message: `Double check your Visa expiry date before departing for ${trip.destination}! (Trip ID: ${trip._id})`,
            type: "Visa",
          });
        }
      }

      // E. Passport Expiry Reminder (if Passport travel doc uploaded)
      const hasPassportDoc = await TravelDocument.exists({ tripId: trip._id, docType: "Passport" });
      if (hasPassportDoc) {
        const existingPassportRem = await Notification.findOne({
          userId,
          message: { $regex: trip._id.toString() },
          type: "Passport",
        });

        if (!existingPassportRem) {
          await Notification.create({
            userId,
            title: `Passport Validity: ${trip.title}`,
            message: `Make sure your passport is valid for at least 6 months for ${trip.destination}! (Trip ID: ${trip._id})`,
            type: "Passport",
          });
        }
      }
    }

    // 3. Return all notifications
    const notifications = await Notification.find({ userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Mark Notification as Read
// ============================================
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ============================================
// Clear All Notifications
// ============================================
export const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Clear notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
