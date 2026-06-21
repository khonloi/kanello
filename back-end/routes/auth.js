var express = require("express");
var router = express.Router();
const { db } = require("../utils/firebase");

/* Save or Update User's GitHub Access Token */
router.post("/github-token", async function (req, res, next) {
  try {
    const { githubAccessToken } = req.body;
    if (!githubAccessToken) {
      return res.status(400).json({ error: "Missing githubAccessToken" });
    }

    const uid = req.user.uid;
    const email = req.user.email;

    await db.collection("users").doc(uid).set({
      email: email || "",
      githubAccessToken: githubAccessToken
    }, { merge: true });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/* Search User by Email */
router.get("/users", async function (req, res, next) {
  try {
    const { email } = req.query;
    if (email) {
      const userSnap = await db.collection("users").where("email", "==", email.toLowerCase()).get();
      if (userSnap.empty) {
        return res.status(404).json({ error: "User not found" });
      }
      const userDoc = userSnap.docs[0];
      return res.json([{ _id: userDoc.id, email: userDoc.data().email }]);
    }
    
    const usersSnap = await db.collection("users").get();
    const users = usersSnap.docs.map(doc => ({ _id: doc.id, email: doc.data().email }));
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
