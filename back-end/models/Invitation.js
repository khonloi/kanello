const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
    },
    board_owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true],
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true],
    },
    email_member: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Invitation", invitationSchema);
