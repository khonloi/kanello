var express = require("express");
var router = express.Router({ mergeParams: true });

const Card = require("../models/Card");
const Task = require("../models/Task");
const Board = require("../models/Board");

/* Retrieve All Tasks */
router.get("/", async function (req, res, next) {
  try {
    const { boardId, cardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
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

    const tasks = await Task.find({ cardId });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

/* Retrieve Task Details */
router.get("/:id", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
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

    const task = await Task.findOne({ _id: id, cardId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

/* Create a New Task */
router.post("/", async function (req, res, next) {
  try {
    const { boardId, cardId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { title, description, status } = req.body;
    const task = new Task({ title, description, status, cardId });
    await task.save();

    card.task_count = (card.task_count || 0) + 1;
    await card.save();

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

/* Update Task Details */
router.put("/:id", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
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

    const task = await Task.findOne({ _id: id, cardId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (!isOwner) {
      // Must be assigned to update status
      const isAssigned = task.memberId.some((mId) => mId.toString() === req.user._id.toString());
      if (!isAssigned) {
        return res.status(403).json({ error: "Access denied: You are not assigned to this task" });
      }

      // Cannot update title or description
      const { title, description } = req.body;
      if (title !== undefined || description !== undefined) {
        return res.status(403).json({ error: "Access denied: Members can only update task status" });
      }

      const { status } = req.body;
      if (status !== undefined) task.status = status;
    } else {
      const { title, description, status } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    next(err);
  }
});

/* Delete Task */
router.delete("/:id", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    const task = await Task.findOneAndDelete({ _id: id, cardId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    card.task_count = Math.max(0, (card.task_count || 0) - 1);
    await card.save();

    res.json({ message: "Task successfully deleted" });
  } catch (err) {
    next(err);
  }
});

/* Retrieve All Assigned Members of a Task */
router.get("/:id/assign", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
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

    const task = await Task.findOne({ _id: id, cardId }).populate("memberId", "_id email");
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task.memberId);
  } catch (err) {
    next(err);
  }
});

/* Assign a Member to a Task */
router.post("/:id/assign", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(404).json({ error: "Card not found" });
    }

    const task = await Task.findOne({ _id: id, cardId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ error: "memberId is required" });
    }

    // Check if user exists
    const User = require("../models/User");
    const targetUser = await User.findById(memberId);
    if (!targetUser) {
      return res.status(404).json({ error: "User to assign not found" });
    }

    // Check if user is a member of the board
    const isMemberOfBoard = board.list_member.includes(memberId) || board.userId.toString() === memberId.toString();
    if (!isMemberOfBoard) {
      return res.status(400).json({ error: "User is not a member of this board" });
    }

    // Add to memberId array
    if (!task.memberId.includes(memberId)) {
      task.memberId.push(memberId);
      await task.save();
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
});

/* Remove a Member Assignment from a Task */
router.delete("/:id/assign/:memberId", async function (req, res, next) {
  try {
    const { boardId, cardId, id, memberId } = req.params;
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }
    const card = await Card.findOne({ _id: cardId, boardId });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(404).json({ error: "Card not found" });
    }

    const task = await Task.findOne({ _id: id, cardId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Remove from memberId array
    task.memberId = task.memberId.filter((mId) => mId.toString() !== memberId.toString());
    await task.save();

    res.json({ message: "Member successfully unassigned from task", task });
  } catch (err) {
    next(err);
  }
});

/* Move Task to a different Card (Drag and Drop) */
router.put("/:id/move", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const { newCardId } = req.body;

    if (!newCardId) {
      return res.status(400).json({ error: "newCardId is required" });
    }

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
      return res.status(404).json({ error: "Card not found" });
    }

    const oldCard = await Card.findOne({ _id: cardId, boardId });
    if (!oldCard) {
      return res.status(404).json({ error: "Old Card not found" });
    }

    const newCard = await Card.findOne({ _id: newCardId, boardId });
    if (!newCard) {
      return res.status(404).json({ error: "New Card not found" });
    }

    const task = await Task.findOne({ _id: id, cardId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Must be assigned or owner to move task
    if (!isOwner) {
      const isAssigned = task.memberId.some((mId) => mId.toString() === req.user._id.toString());
      if (!isAssigned) {
         return res.status(403).json({ error: "Access denied: You are not assigned to this task" });
      }
    }

    task.cardId = newCardId;
    await task.save();

    oldCard.task_count = Math.max(0, (oldCard.task_count || 0) - 1);
    await oldCard.save();

    newCard.task_count = (newCard.task_count || 0) + 1;
    await newCard.save();

    res.json(task);
  } catch (err) {
    next(err);
  }
});

/* Attach a GitHub Resource to a Task */
router.post("/:id/github-attach", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const { type, number, sha } = req.body;
    
    if (!["pull_request", "commit", "issue"].includes(type)) {
      return res.status(400).json({ error: "Invalid attachment type" });
    }

    const task = await Task.findOne({ _id: id, cardId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Validate access (basic check)
    const board = await Board.findById(boardId);
    if (!board) return res.status(404).json({ error: "Board not found" });

    const newAttachment = { type, number, sha };
    task.githubAttachments.push(newAttachment);
    await task.save();

    const savedAttachment = task.githubAttachments[task.githubAttachments.length - 1];

    res.status(201).json({
      taskId: id,
      attachmentId: savedAttachment._id,
      type: savedAttachment.type,
      number: savedAttachment.number,
      sha: savedAttachment.sha,
    });
  } catch (err) {
    next(err);
  }
});

/* Retrieve Attached GitHub Attachments of a Task */
router.get("/:id/github-attachments", async function (req, res, next) {
  try {
    const { cardId, id } = req.params;
    const task = await Task.findOne({ _id: id, cardId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    const attachments = task.githubAttachments.map(att => ({
      attachmentId: att._id,
      type: att.type,
      number: att.number,
      sha: att.sha,
    }));
    
    res.json(attachments);
  } catch (err) {
    next(err);
  }
});

/* Remove GitHub Attachment from a Task */
router.delete("/:id/github-attachments/:attachmentId", async function (req, res, next) {
  try {
    const { cardId, id, attachmentId } = req.params;
    const task = await Task.findOne({ _id: id, cardId });
    if (!task) return res.status(404).json({ error: "Task not found" });

    task.githubAttachments = task.githubAttachments.filter(
      att => att._id.toString() !== attachmentId.toString()
    );
    await task.save();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
