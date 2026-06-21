var express = require("express");
var router = express.Router();
const { db } = require("../utils/firebase");

/* Retrieve all invitations for the authenticated user */
router.get("/", async function (req, res, next) {
  try {
    const invitesSnap = await db.collection("invitations").where("member_id", "==", req.user._id).get();
    const invitations = invitesSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(invitations);
  } catch (err) {
    next(err);
  }
});

/* Retrieve all invitations sent by the authenticated user */
router.get("/sent", async function (req, res, next) {
  try {
    const invitesSnap = await db.collection("invitations").where("board_owner_id", "==", req.user._id).get();
    const invitations = invitesSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
    res.json(invitations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
