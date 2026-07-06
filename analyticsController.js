import Trip from "../models/Trip.js";
import Expense from "../models/Expense.js";
import PackingChecklist from "../models/PackingChecklist.js";

// ============================================
// Get Dashboard Analytics
// ============================================
export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all trips for this user
    const trips = await Trip.find({ createdBy: userId }).sort({ createdAt: -1 });
    const tripCount = trips.length;

    const now = new Date();
    let upcomingTripsCount = 0;
    let completedTripsCount = 0;
    let totalBudget = 0;

    trips.forEach((trip) => {
      totalBudget += trip.budget || 0;
      if (new Date(trip.startDate) > now) {
        upcomingTripsCount++;
      } else if (new Date(trip.endDate) < now) {
        completedTripsCount++;
      }
    });

    const tripIds = trips.map((t) => t._id);

    // 2. Fetch all expenses for these trips
    const expenses = await Expense.find({ tripId: { $in: tripIds } });
    let totalSpent = 0;
    const expenseByCategory = {
      Flight: 0,
      Hotel: 0,
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Activity: 0,
      Other: 0,
    };

    expenses.forEach((expense) => {
      totalSpent += expense.amount || 0;
      if (expense.category && expenseByCategory[expense.category] !== undefined) {
        expenseByCategory[expense.category] += expense.amount || 0;
      } else {
        expenseByCategory["Other"] += expense.amount || 0;
      }
    });

    const remainingBudget = totalBudget - totalSpent;

    // 3. Fetch packing checklist progress for these trips
    const packingItems = await PackingChecklist.find({ tripId: { $in: tripIds } });
    const totalPackingItems = packingItems.length;
    const packedItemsCount = packingItems.filter((item) => item.isPacked).length;
    const packingProgress = {
      total: totalPackingItems,
      packed: packedItemsCount,
      percentage: totalPackingItems > 0 ? Math.round((packedItemsCount / totalPackingItems) * 100) : 0,
    };

    // 4. Get 3 recent trips
    const recentTrips = trips.slice(0, 3);

    // 5. Structure Expense Summary
    const expenseSummary = Object.keys(expenseByCategory).map((cat) => ({
      category: cat,
      amount: expenseByCategory[cat],
    }));

    res.status(200).json({
      success: true,
      analytics: {
        tripCount,
        upcomingTrips: upcomingTripsCount,
        completedTrips: completedTripsCount,
        budget: totalBudget,
        spent: totalSpent,
        remaining: remainingBudget,
        packingProgress,
        expenseSummary,
        recentTrips,
      },
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
