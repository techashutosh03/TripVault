import mongoose from "mongoose";

const packingChecklistSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      default: "General",
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
    },

    isPacked: {
      type: Boolean,
      required: true,
      default: false,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PackingChecklist", packingChecklistSchema);
