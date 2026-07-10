import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Flight",
        "Hotel",
        "Food",
        "Transport",
        "Shopping",
        "Activity",
        "Other",
      ],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Credit Card", "Debit Card", "UPI", "Bank Transfer"],
      default: "Cash",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Expense", expenseSchema);