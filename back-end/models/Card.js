const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: [true],
    },
    name: {
      type: String,
      required: [true, "A card name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A card description is required"],
    },
    task_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    list_member: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Card", cardSchema);
