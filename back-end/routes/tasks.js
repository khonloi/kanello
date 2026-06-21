var express = require("express");
var router = express.Router({ mergeParams: true });
const { db } = require("../utils/firebase");

/* Retrieve All Tasks */
router.get("/", async function (req, res, next) {
  try {
    const { boardId, cardId } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardDoc = await db.collection("cards").doc(cardId).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const board = boardDoc.data();
    const isOwner = board.userId === req.user._id;
    const isBoardMember = (board.list_member || []).includes(req.user._id);
    
    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Card not found" });
    }

    const tasksSnap = await db.collection("tasks").where("cardId", "==", cardId).get();
    const tasks = tasksSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

/* Retrieve Task Details */
router.get("/:id", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardDoc = await db.collection("cards").doc(cardId).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const board = boardDoc.data();
    const isOwner = board.userId === req.user._id;
    const isBoardMember = (board.list_member || []).includes(req.user._id);
    
    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Card not found" });
    }

    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json({ _id: taskDoc.id, ...taskDoc.data() });
  } catch (err) {
    next(err);
  }
});

/* Create a New Task */
router.post("/", async function (req, res, next) {
  try {
    const { boardId, cardId } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardRef = db.collection("cards").doc(cardId);
    const cardDoc = await cardRef.get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = boardDoc.data().userId === req.user._id;
    if (!isOwner) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { title, description, status } = req.body;
    const taskRef = db.collection("tasks").doc();
    const taskData = {
      title,
      description,
      status,
      cardId,
      memberId: [],
      githubAttachments: [],
      createdAt: new Date()
    };
    await taskRef.set(taskData);

    const { FieldValue } = require("firebase-admin/firestore");
    await cardRef.update({
      task_count: FieldValue.increment(1)
    });

    res.status(201).json({ _id: taskRef.id, ...taskData });
  } catch (err) {
    next(err);
  }
});

/* Update Task Details */
router.put("/:id", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardDoc = await db.collection("cards").doc(cardId).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const board = boardDoc.data();
    const isOwner = board.userId === req.user._id;
    const isBoardMember = (board.list_member || []).includes(req.user._id);
    
    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Card not found" });
    }

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskDoc.data();
    const updates = {};

    if (!isOwner) {
      const isAssigned = (task.memberId || []).includes(req.user._id);
      if (!isAssigned) {
        return res.status(403).json({ error: "Access denied: You are not assigned to this task" });
      }

      const { title, description } = req.body;
      if (title !== undefined || description !== undefined) {
        return res.status(403).json({ error: "Access denied: Members can only update task status" });
      }

      const { status } = req.body;
      if (status !== undefined) updates.status = status;
    } else {
      const { title, description, status } = req.body;
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (status !== undefined) updates.status = status;
    }

    if (Object.keys(updates).length > 0) {
      await taskRef.update(updates);
    }
    
    res.json({ _id: taskRef.id, ...task, ...updates });
  } catch (err) {
    next(err);
  }
});

/* Delete Task */
router.delete("/:id", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardRef = db.collection("cards").doc(cardId);
    const cardDoc = await cardRef.get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    if (boardDoc.data().userId !== req.user._id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    await taskRef.delete();

    const currentCount = cardDoc.data().task_count || 0;
    await cardRef.update({
      task_count: Math.max(0, currentCount - 1)
    });

    res.json({ message: "Task successfully deleted" });
  } catch (err) {
    next(err);
  }
});

/* Retrieve All Assigned Members of a Task */
router.get("/:id/assign", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardDoc = await db.collection("cards").doc(cardId).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const board = boardDoc.data();
    const isOwner = board.userId === req.user._id;
    const isBoardMember = (board.list_member || []).includes(req.user._id);
    
    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Card not found" });
    }

    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const memberIds = taskDoc.data().memberId || [];
    if (memberIds.length === 0) return res.json([]);

    const members = [];
    for (const mId of memberIds) {
      const mDoc = await db.collection("users").doc(mId).get();
      if (mDoc.exists) {
        members.push({ _id: mDoc.id, email: mDoc.data().email });
      }
    }
    res.json(members);
  } catch (err) {
    next(err);
  }
});

/* Assign a Member to a Task */
router.post("/:id/assign", async function (req, res, next) {
  try {
    const { boardId, cardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardDoc = await db.collection("cards").doc(cardId).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const board = boardDoc.data();
    if (board.userId !== req.user._id) {
      return res.status(404).json({ error: "Card not found" });
    }

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ error: "memberId is required" });
    }

    const targetUserDoc = await db.collection("users").doc(memberId).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: "User to assign not found" });
    }

    const isMemberOfBoard = (board.list_member || []).includes(memberId) || board.userId === memberId;
    if (!isMemberOfBoard) {
      return res.status(400).json({ error: "User is not a member of this board" });
    }

    const { FieldValue } = require("firebase-admin/firestore");
    await taskRef.update({
      memberId: FieldValue.arrayUnion(memberId)
    });

    const updatedTaskDoc = await taskRef.get();
    res.json({ _id: taskRef.id, ...updatedTaskDoc.data() });
  } catch (err) {
    next(err);
  }
});

/* Remove a Member Assignment from a Task */
router.delete("/:id/assign/:memberId", async function (req, res, next) {
  try {
    const { boardId, cardId, id, memberId } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardDoc = await db.collection("cards").doc(cardId).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    if (boardDoc.data().userId !== req.user._id) {
      return res.status(404).json({ error: "Card not found" });
    }

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { FieldValue } = require("firebase-admin/firestore");
    await taskRef.update({
      memberId: FieldValue.arrayRemove(memberId)
    });

    const updatedTaskDoc = await taskRef.get();
    res.json({ message: "Member successfully unassigned from task", task: { _id: taskRef.id, ...updatedTaskDoc.data() } });
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

    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }

    const board = boardDoc.data();
    const isOwner = board.userId === req.user._id;
    const isBoardMember = (board.list_member || []).includes(req.user._id);
    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Card not found" });
    }

    const oldCardRef = db.collection("cards").doc(cardId);
    const oldCardDoc = await oldCardRef.get();
    if (!oldCardDoc.exists || oldCardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Old Card not found" });
    }

    const newCardRef = db.collection("cards").doc(newCardId);
    const newCardDoc = await newCardRef.get();
    if (!newCardDoc.exists || newCardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "New Card not found" });
    }

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const task = taskDoc.data();
    if (!isOwner) {
      const isAssigned = (task.memberId || []).includes(req.user._id);
      if (!isAssigned) {
         return res.status(403).json({ error: "Access denied: You are not assigned to this task" });
      }
    }

    await taskRef.update({ cardId: newCardId });

    const currentOldCount = oldCardDoc.data().task_count || 0;
    await oldCardRef.update({ task_count: Math.max(0, currentOldCount - 1) });

    const { FieldValue } = require("firebase-admin/firestore");
    await newCardRef.update({ task_count: FieldValue.increment(1) });

    res.json({ _id: taskRef.id, ...task, cardId: newCardId });
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

    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) return res.status(404).json({ error: "Board not found" });

    // Generate a simple ID for the attachment
    const attachmentId = Math.random().toString(36).substring(2, 10);
    const newAttachment = { _id: attachmentId, type };
    if (number !== undefined) newAttachment.number = number;
    if (sha !== undefined) newAttachment.sha = sha;
    
    const { FieldValue } = require("firebase-admin/firestore");
    await taskRef.update({
      githubAttachments: FieldValue.arrayUnion(newAttachment)
    });

    res.status(201).json({
      taskId: id,
      attachmentId: attachmentId,
      type,
      number,
      sha,
    });
  } catch (err) {
    next(err);
  }
});

/* Retrieve Attached GitHub Attachments of a Task */
router.get("/:id/github-attachments", async function (req, res, next) {
  try {
    const { cardId, id } = req.params;
    const taskDoc = await db.collection("tasks").doc(id).get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const attachments = (taskDoc.data().githubAttachments || []).map(att => ({
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
    const taskRef = db.collection("tasks").doc(id);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists || taskDoc.data().cardId !== cardId) {
      return res.status(404).json({ error: "Task not found" });
    }

    const attachments = taskDoc.data().githubAttachments || [];
    const attachmentToRemove = attachments.find(att => att._id === attachmentId);

    if (attachmentToRemove) {
      const { FieldValue } = require("firebase-admin/firestore");
      await taskRef.update({
        githubAttachments: FieldValue.arrayRemove(attachmentToRemove)
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
