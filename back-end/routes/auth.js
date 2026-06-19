var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-fallback-secret-key";

/* Sign Up a New User */
router.post("/signup", async function (req, res, next) {
  try {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ error: "Email and verification code are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({ email, verificationCode });
    await user.save();

    res.status(201).json({ user: { _id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

/* Sign In User */
router.post("/signin", async function (req, res, next) {
  try {
    const { email, verificationCode } = req.body;
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ error: "Email and verification code are required" });
    }

    const user = await User.findOne({ email });
    if (!user || user.verificationCode !== verificationCode) {
      return res
        .status(401)
        .json({ error: "Invalid email or verification code" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/* Search User by Email */
router.get("/users", async function (req, res, next) {
  try {
    const { email } = req.query;
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() }, "_id email");
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json([user]);
    }
    const users = await User.find({}, "_id email");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
