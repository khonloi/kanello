var express = require("express");
var router = express.Router({ mergeParams: true });
const { db } = require("../utils/firebase");

const tasksRouter = require("./tasks");

// Nest task routes under cards
router.use("/:cardId/tasks", tasksRouter);

/* Retrieve All Cards */
router.get("/", async function (req, res, next) {
  try {
    const { boardId } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    
    const board = boardDoc.data();
    const isOwner = board.userId === req.user._id;
    const isBoardMember = (board.list_member || []).includes(req.user._id);

    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Board not found" });
    }

    const cardsSnap = await db.collection("cards").where("boardId", "==", boardId).get();
    const cards = cardsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

/* Retrieve Cards by User (Board Owner only) */
router.get("/user/:user_id", async function (req, res, next) {
  try {
    const { boardId, user_id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data().userId !== req.user._id) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardsSnap = await db.collection("cards")
      .where("boardId", "==", boardId)
      .where("list_member", "array-contains", user_id)
      .get();
    const cards = cardsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(cards);
  } catch (err) {
    next(err);
  }
});

/* Retrieve Card Details */
router.get("/:id", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const board = boardDoc.data();
    
    const cardDoc = await db.collection("cards").doc(id).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const isOwner = board.userId === req.user._id;
    const isBoardMember = (board.list_member || []).includes(req.user._id);

    if (!isOwner && !isBoardMember) {
      return res.status(404).json({ error: "Card not found" });
    }
    res.json({ _id: cardDoc.id, ...cardDoc.data() });
  } catch (err) {
    next(err);
  }
});

/* Create a New Card */
router.post("/", async function (req, res, next) {
  try {
    const { boardId } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data().userId !== req.user._id) {
      return res.status(404).json({ error: "Board not found" });
    }
    const { name, description } = req.body;
    
    const cardRef = db.collection("cards").doc();
    const cardData = {
      name,
      description,
      boardId,
      list_member: [],
      task_count: 0,
      createdAt: new Date()
    };
    await cardRef.set(cardData);
    res.status(201).json({ _id: cardRef.id, ...cardData });
  } catch (err) {
    next(err);
  }
});

/* Update Card Details */
router.put("/:id", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardRef = db.collection("cards").doc(id);
    const cardDoc = await cardRef.get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    if (boardDoc.data().userId !== req.user._id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { name, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    
    if (Object.keys(updates).length > 0) {
      await cardRef.update(updates);
    }
    res.json({ _id: cardRef.id, ...cardDoc.data(), ...updates });
  } catch (err) {
    next(err);
  }
});

/* Delete Card */
router.delete("/:id", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardRef = db.collection("cards").doc(id);
    const cardDoc = await cardRef.get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    if (boardDoc.data().userId !== req.user._id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete all tasks for this card
    const tasksSnap = await db.collection("tasks").where("cardId", "==", id).get();
    const batch = db.batch();
    tasksSnap.docs.forEach(tDoc => batch.delete(tDoc.ref));
    await batch.commit();

    // Delete all invitations for this card
    const invSnap = await db.collection("invitations").where("cardId", "==", id).get();
    const batchInv = db.batch();
    invSnap.docs.forEach(iDoc => batchInv.delete(iDoc.ref));
    await batchInv.commit();

    await cardRef.delete();
    res.json({ message: "Card successfully deleted along with tasks and invitations" });
  } catch (err) {
    next(err);
  }
});

/* Invite User to Card */
router.post("/:id/invite", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists || boardDoc.data().userId !== req.user._id) {
      return res.status(404).json({ error: "Board not found" });
    }
    const cardDoc = await db.collection("cards").doc(id).get();
    if (!cardDoc.exists || cardDoc.data().boardId !== boardId) {
      return res.status(404).json({ error: "Card not found" });
    }

    const { member_id, email_member } = req.body;
    if (!member_id) {
      return res.status(400).json({ error: "member_id is required" });
    }

    const targetUserDoc = await db.collection("users").doc(member_id).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: "User to invite not found" });
    }

    if ((cardDoc.data().list_member || []).includes(member_id)) {
      return res.status(400).json({ error: "User is already a member of this card" });
    }

    const existingInvites = await db.collection("invitations")
      .where("cardId", "==", id)
      .where("member_id", "==", member_id)
      .where("status", "in", ["pending", "accepted"])
      .get();
      
    if (!existingInvites.empty) {
      return res.status(400).json({ error: "User already invited or is already a member" });
    }

    const invitationRef = db.collection("invitations").doc();
    const invitationData = {
      boardId,
      cardId: id,
      board_owner_id: req.user._id,
      member_id,
      email_member,
      status: "pending",
      createdAt: new Date()
    };
    await invitationRef.set(invitationData);
    res.status(201).json({ _id: invitationRef.id, ...invitationData });
  } catch (err) {
    next(err);
  }
});

/* Accept Invitation to Card */
router.post("/:id/invite/accept", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const invitesSnap = await db.collection("invitations")
      .where("cardId", "==", id)
      .where("boardId", "==", boardId)
      .where("member_id", "==", req.user._id)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (invitesSnap.empty) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    const inviteDoc = invitesSnap.docs[0];
    await inviteDoc.ref.update({ status: "accepted" });

    const cardRef = db.collection("cards").doc(id);
    const { FieldValue } = require("firebase-admin/firestore");
    await cardRef.update({
      list_member: FieldValue.arrayUnion(req.user._id)
    });

    res.json({ message: "Invitation accepted successfully", invitation: { _id: inviteDoc.id, ...inviteDoc.data(), status: "accepted" } });
  } catch (err) {
    next(err);
  }
});

/* Decline Invitation to Card */
router.post("/:id/invite/decline", async function (req, res, next) {
  try {
    const { boardId, id } = req.params;
    const invitesSnap = await db.collection("invitations")
      .where("cardId", "==", id)
      .where("boardId", "==", boardId)
      .where("member_id", "==", req.user._id)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (invitesSnap.empty) {
      return res.status(404).json({ error: "Invitation not found" });
    }
    const inviteDoc = invitesSnap.docs[0];
    await inviteDoc.ref.update({ status: "declined" });

    res.json({ message: "Invitation declined successfully", invitation: { _id: inviteDoc.id, ...inviteDoc.data(), status: "declined" } });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
