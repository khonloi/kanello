const mongoose = require("mongoose");

const githubAttachmentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["pull_request", "commit", "issue"],
    required: true,
  },
  number: String,
  sha: String,
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A task description is required"],
    },
    status: {
      type: String,
      required: [true, "A task status is required"],
    },
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: [true],
    },
    memberId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    githubAttachments: [githubAttachmentSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Task", taskSchema);
