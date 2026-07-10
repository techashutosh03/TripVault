import mongoose from "mongoose";

const travelDocumentSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },

    docType: {
      type: String,
      enum: [
        "Passport",
        "Visa",
        "Insurance",
        "Flight Tickets",
        "Hotel Booking",
        "Rail Pass",
        "Driving License",
        "Other",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
    },

    fileId: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("TravelDocument", travelDocumentSchema);
