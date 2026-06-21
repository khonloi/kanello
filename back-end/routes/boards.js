var express = require("express");
var router = express.Router();
const { db } = require("../utils/firebase");

const cardsRouter = require("./cards");

/* Nest card routes under boards */
router.use("/:boardId/cards", cardsRouter);

/* Retrieve All Boards */
router.get("/", async function (req, res, next) {
  try {
    const userId = req.user._id;
    // Run two queries and merge to simulate $or
    const ownedBoardsSnap = await db.collection("boards").where("userId", "==", userId).get();
    const memberBoardsSnap = await db.collection("boards").where("list_member", "array-contains", userId).get();

    const boardsMap = new Map();
    
    ownedBoardsSnap.forEach(doc => boardsMap.set(doc.id, { _id: doc.id, ...doc.data() }));
    memberBoardsSnap.forEach(doc => boardsMap.set(doc.id, { _id: doc.id, ...doc.data() }));

    res.json(Array.from(boardsMap.values()));
  } catch (err) {
    next(err);
  }
});

/* Retrieve Board Details */
router.get("/:id", async function (req, res, next) {
  try {
    const doc = await db.collection("boards").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const data = doc.data();
    if (data.userId !== req.user._id && !(data.list_member || []).includes(req.user._id)) {
       return res.status(404).json({ error: "Board not found" });
    }
    res.json({ _id: doc.id, ...data });
  } catch (err) {
    next(err);
  }
});

/* Retrieve All Members of a Board */
router.get("/:id/members", async function (req, res, next) {
  try {
    const doc = await db.collection("boards").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const data = doc.data();
    if (data.userId !== req.user._id && !(data.list_member || []).includes(req.user._id)) {
      return res.status(404).json({ error: "Board not found" });
    }

    const memberIds = data.list_member || [];
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

/* Invite User to Board */
router.post("/:id/invite", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    const boardDoc = await db.collection("boards").doc(boardId).get();
    if (!boardDoc.exists) {
      return res.status(404).json({ error: "Board not found" });
    }
    const board = boardDoc.data();

    if (board.userId !== req.user._id) {
      return res.status(403).json({ error: "Only the board owner can invite members" });
    }

    const { member_id, email_member } = req.body;
    if (!member_id) {
      return res.status(400).json({ error: "member_id is required" });
    }

    const targetUserDoc = await db.collection("users").doc(member_id).get();
    if (!targetUserDoc.exists) {
      return res.status(404).json({ error: "User to invite not found" });
    }

    if ((board.list_member || []).includes(member_id)) {
      return res.status(400).json({ error: "User is already a member of this board" });
    }

    const existingInvites = await db.collection("invitations")
      .where("boardId", "==", boardId)
      .where("member_id", "==", member_id)
      .where("status", "in", ["pending", "accepted"])
      .get();

    if (!existingInvites.empty) {
      return res.status(400).json({ error: "User already invited or is already a member" });
    }

    const invitationRef = db.collection("invitations").doc();
    const invitationData = {
      boardId,
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

/* Accept Board Invitation */
router.post("/:id/invite/accept", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    
    const invitesSnap = await db.collection("invitations")
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

    const boardRef = db.collection("boards").doc(boardId);
    const { FieldValue } = require("firebase-admin/firestore");
    await boardRef.update({
      list_member: FieldValue.arrayUnion(req.user._id)
    });

    res.json({ message: "Invitation accepted successfully", invitation: { _id: inviteDoc.id, ...inviteDoc.data(), status: "accepted" } });
  } catch (err) {
    next(err);
  }
});

/* Decline Board Invitation */
router.post("/:id/invite/decline", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    
    const invitesSnap = await db.collection("invitations")
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

/* Create a New Board */
router.post("/", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const boardRef = db.collection("boards").doc();
    const boardData = {
      name,
      description,
      userId: req.user._id,
      list_member: [],
      createdAt: new Date()
    };
    await boardRef.set(boardData);
    res.status(201).json({ _id: boardRef.id, ...boardData });
  } catch (err) {
    next(err);
  }
});

/* Update Board Details */
router.put("/:id", async function (req, res, next) {
  try {
    const { name, description } = req.body;
    const boardRef = db.collection("boards").doc(req.params.id);
    const doc = await boardRef.get();
    if (!doc.exists || doc.data().userId !== req.user._id) {
       return res.status(404).json({ error: "Board not found" });
    }
    await boardRef.update({ name, description });
    
    res.json({ _id: boardRef.id, ...doc.data(), name, description });
  } catch (err) {
    next(err);
  }
});

/* Delete Board */
router.delete("/:id", async function (req, res, next) {
  try {
    const boardId = req.params.id;
    const boardRef = db.collection("boards").doc(boardId);
    const doc = await boardRef.get();
    if (!doc.exists || doc.data().userId !== req.user._id) {
      return res.status(404).json({ error: "Board not found" });
    }

    // Find all cards on this board
    const cardsSnap = await db.collection("cards").where("boardId", "==", boardId).get();
    const cardIds = cardsSnap.docs.map(c => c.id);

    if (cardIds.length > 0) {
      for (let i = 0; i < cardIds.length; i += 10) {
        const chunk = cardIds.slice(i, i + 10);
        const tasksSnap = await db.collection("tasks").where("cardId", "in", chunk).get();
        const batch = db.batch();
        tasksSnap.docs.forEach(tDoc => batch.delete(tDoc.ref));
        await batch.commit();
      }
    }

    // Delete all invitations for this board
    const invSnap = await db.collection("invitations").where("boardId", "==", boardId).get();
    if (!invSnap.empty) {
      const batchInv = db.batch();
      invSnap.docs.forEach(iDoc => batchInv.delete(iDoc.ref));
      await batchInv.commit();
    }

    // Delete all cards
    if (!cardsSnap.empty) {
      const batchCards = db.batch();
      cardsSnap.docs.forEach(cDoc => batchCards.delete(cDoc.ref));
      await batchCards.commit();
    }

    // Delete the board
    await boardRef.delete();

    res.json({
      message: "Board successfully deleted along with all cards, tasks, and invitations",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
