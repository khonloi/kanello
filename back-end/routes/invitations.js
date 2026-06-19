var express = require("express");
var router = express.Router();
const Invitation = require("../models/Invitation");

/* Retrieve all invitations for the authenticated user */
router.get("/", async function (req, res, next) {
  try {
    const invitations = await Invitation.find({ member_id: req.user._id });
    res.json(invitations);
  } catch (err) {
    next(err);
  }
});

/* Retrieve all invitations sent by the authenticated user */
router.get("/sent", async function (req, res, next) {
  try {
    const invitations = await Invitation.find({ board_owner_id: req.user._id });
    res.json(invitations);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
