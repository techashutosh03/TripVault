import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    time: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  { _id: true }
);

const itinerarySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    dayNumber: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    activities: [activitySchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Itinerary", itinerarySchema);