var express = require("express");
var router = express.Router({ mergeParams: true });

const Card = require("../models/Card");
const Board = require("../models/Board");
const tasksRouter = require("./tasks");

// Nest task routes under cards
router.use("/:cardId/tasks", tasksRouter);

/* Retrieve All Cards */
router.get("/", async function (req, res, next) {
  try {
    const { boardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    
    const isOwner = board.userId.toString() === req.user._id.toString();
    const isBoardMember = board.list_member && board.list_member.some(m => {
      const mId = m._id ? m._id.toString() : m.toString();
      return mId === req.user._id.toString();
    });

    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Board not found" });
    }

    const cards = await Card.find({ boardId });
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

/* Retrieve Cards by User (Board Owner only) */
router.get("/user/:user_id", async function (req, res, next) {
  try {
    const { boardId, user_id } = req.params;
    const board = await Board.findOne({ _id: boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cards = await Card.find({ boardId, list_member: user_id });
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

/* Retrieve Card Details */
router.get("/:id", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: id, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId.toString() === req.user._id.toString();
    const isBoardMember = board.list_member && board.list_member.some(m => {
      const mId = m._id ? m._id.toString() : m.toString();
      return mId === req.user._id.toString();
    });

    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json(card);
  } catch (err) {
    next(err);
  }
});

/* Create a New Card */
router.post("/", async function (req, res, next) {
  try {
    const { boardId } = req.params;
    const board = await Board.findOne({ _id: boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const { name, description } = req.body;
    const card = new Card({ name, description, boardId });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    next(err);
  }
});

/* Update Card Details */
router.put("/:id", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: id, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { name, description } = req.body;
    if (name !== undefined) card.name = name;
    if (description !== undefined) card.description = description;
    await card.save();
    res.json(card);
  } catch (err) {
    next(err);
  }
});

/* Delete Card */
router.delete("/:id", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: id, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete all tasks for this card
    const Task = require("../models/Task");
    await Task.deleteMany({ cardId: id });

    // Delete all invitations for this card
    const Invitation = require("../models/Invitation");
    await Invitation.deleteMany({ cardId: id });

    await Card.deleteOne({ _id: id, boardId });
    res.json({ message: "Card successfully deleted along with tasks and invitations" });
  } catch (err) {
    next(err);
  }
});

/* Invite User to Card */
router.post("/:id/invite", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const board = await Board.findOne({ _id: boardId, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: id, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const { member_id, email_member } = req.body;

    // Check if the user exists
    const User = require("../models/User");
    const targetUser = await User.findById(member_id);
    if (!targetUser) {
      return res.status(404).json({ error: "User to invite not found" });
    }

    // Check if user is already a member
    if (card.list_member.includes(member_id)) {
      return res.status(400).json({ error: "User is already a member of this card" });
    }

    // Check for existing pending or accepted invitation
    const Invitation = require("../models/Invitation");
    const existingInvite = await Invitation.findOne({
      cardId: id,
      member_id,
      status: { $in: ["pending", "accepted"] }
    });
    if (existingInvite) {
      return res.status(400).json({ error: "User already invited or is already a member" });
    }

    const invitation = new Invitation({
      boardId,
      cardId: id,
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

/* Accept Invitation to Card */
router.post("/:id/invite/accept", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const Invitation = require("../models/Invitation");
    const invitation = await Invitation.findOne({
      cardId: id,
      boardId,
      member_id: req.user._id,
      status: "pending",
    });
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    invitation.status = "accepted";
    await invitation.save();

    await Card.findByIdAndUpdate(id, {
      $addToSet: { list_member: req.user._id },
    });

    res.json({ message: "Invitation accepted successfully", invitation });
  } catch (err) {
    next(err);
  }
});

/* Decline Invitation to Card */
router.post("/:id/invite/decline", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const Invitation = require("../models/Invitation");
    const invitation = await Invitation.findOne({
      cardId: id,
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

module.exports = router;
