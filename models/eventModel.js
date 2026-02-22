const mongoose = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    start: Date,
    end: Date,
    color: {
      type: String,
      default: "white", // Default to white or allow frontend generation
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Event", eventSchema);
