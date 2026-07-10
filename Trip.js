import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    budget: {
      type: Number,
      required: true,
      default: 0,
    },

    travelers: {
      type: Number,
      required: true,
      default: 1,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    coverImage: {
      type: String,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

tripSchema.pre("validate", function (next) {
  if (this.createdBy && !this.user) {
    this.user = this.createdBy;
  } else if (this.user && !this.createdBy) {
    this.createdBy = this.user;
  }
  next();
});

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
