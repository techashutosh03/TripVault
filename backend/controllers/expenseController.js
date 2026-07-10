import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Trip from "../models/Trip.js";

// ============================================
// Create Expense
// ============================================
export const createExpense = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Trip ID",
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const expense = await Expense.create({
      ...req.body,
      tripId,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
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
// Get All Expenses
// ============================================
export const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    const expenses = await Expense.find({ tripId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
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
// Update Expense
// ============================================
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
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
// Delete Expense
// ============================================
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
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
// Expense Summary
// ============================================
export const getExpenseSummary = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Trip ID",
      });
    }

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const expenses = await Expense.find({ tripId });

    const spent = expenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );

    const remaining = trip.budget - spent;

    const categorySummary = {};

    expenses.forEach((expense) => {
      if (!categorySummary[expense.category]) {
        categorySummary[expense.category] = 0;
      }

      categorySummary[expense.category] += expense.amount;
    });

    res.status(200).json({
      success: true,
      summary: {
        budget: trip.budget,
        spent,
        remaining,
        totalExpenses: expenses.length,
        categorySummary,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};