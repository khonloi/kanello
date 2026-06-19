var express = require("express");
var router = express.Router();

const Board = require("../models/Board");
const Card = require("../models/Card");
const cardsRouter = require("./cards");

/* Nest card routes under boards */
router.use("/:boardId/cards", cardsRouter);

/* Retrieve All Boards */
router.get("/", async function (req, res, next) {
  try {
    const boards = await Board.find({
      $or: [{ userId: req.user._id }, { list_member: req.user._id }],
    });
    res.json(boards);
  } catch (err) {
    next(err);
  }
});

/* Retrieve Board Details */
router.get("/:id", async function (req, res, next) {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { list_member: req.user._id }],
    });
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    res.json(board);
  } catch (err) {
    next(err);
  }
});

/* Retrieve All Members of a Board */
router.get("/:id/members", async function (req, res, next) {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user._id }, { list_member: req.user._id }],
    }).populate("list_member", "_id email");
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    res.json(board.list_member || []);
  } catch (err) {
    next(err);
  }
});

/* Invite User to Board */
router.post("/:id/invite", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    if (board.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the board owner can invite members" });
    }

    const { member_id, email_member } = req.body;
    if (!member_id) {
      return res.status(400).json({ error: "member_id is required" });
    }

    // Check if user exists
    const User = require("../models/User");
    const targetUser = await User.findById(member_id);
    if (!targetUser) {
      return res.status(404).json({ error: "User to invite not found" });
    }

    // Check if user is already a member
    if (board.list_member.includes(member_id)) {
      return res.status(400).json({ error: "User is already a member of this board" });
    }

    // Check for existing pending or accepted invitation
    const Invitation = require("../models/Invitation");
    const existingInvite = await Invitation.findOne({
      boardId,
      member_id,
      status: { $in: ["pending", "accepted"] }
    });
    if (existingInvite) {
      return res.status(400).json({ error: "User already invited or is already a member" });
    }

    const invitation = new Invitation({
      boardId,
      board_owner_id: req.user._id,
      member_id,
      email_member,
      status: "pending",
    });
    await invitation.save();
    res.status(201).json(invitation);
  } catch (err) {
    next(err);
  }
});

/* Accept Board Invitation */
router.post("/:id/invite/accept", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    const Invitation = require("../models/Invitation");
    const invitation = await Invitation.findOne({
      boardId,
      member_id: req.user._id,
      status: "pending",
    });
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    invitation.status = "accepted";
    await invitation.save();

    await Board.findByIdAndUpdate(boardId, {
      $addToSet: { list_member: req.user._id },
    });

    res.json({ message: "Invitation accepted successfully", invitation });
  } catch (err) {
    next(err);
  }
});

/* Decline Board Invitation */
router.post("/:id/invite/decline", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    const Invitation = require("../models/Invitation");
    const invitation = await Invitation.findOne({
      boardId,
      member_id: req.user._id,
      status: "pending",
    });
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    invitation.status = "declined";
    await invitation.save();

    res.json({ message: "Invitation declined successfully", invitation });
  } catch (err) {
    next(err);
  }
});

/* Create a New Board */
router.post("/", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const board = new Board({ name, description, userId: req.user._id });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
});

/* Update Board Details */
router.put("/:id", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, description },
      { new: true },
    );
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    res.json(board);
  } catch (err) {
    next(err);
  }
});

/* Delete Board */
router.delete("/:id", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    const board = await Board.findOne({ _id: boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Find all cards on this board
    const cards = await Card.find({ boardId });
    const cardIds = cards.map((c) => c._id);

    // Delete all tasks for these cards
    const Task = require("../models/Task");
    await Task.deleteMany({ cardId: { $in: cardIds } });

    // Delete all invitations for this board
    const Invitation = require("../models/Invitation");
    await Invitation.deleteMany({ boardId });

    // Delete all cards
    await Card.deleteMany({ boardId });

    // Delete the board
    await Board.deleteOne({ _id: boardId });

    res.json({
      message:
        "Board successfully deleted along with all cards, tasks, and invitations",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
