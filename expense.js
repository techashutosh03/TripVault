                import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../controllers/expenseController.js";

const router = express.Router();

// Create Expense
router.post("/:tripId", authMiddleware, createExpense);

// Expense Summary
router.get("/summary/:tripId", authMiddleware, getExpenseSummary);

// Get All Expenses
router.get("/:tripId", authMiddleware, getExpenses);

// Update Expense
router.put("/:id", authMiddleware, updateExpense);

// Delete Expense
router.delete("/:id", authMiddleware, deleteExpense);

export default router;