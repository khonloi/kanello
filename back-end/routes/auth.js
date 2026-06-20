var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

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
      const user = await User.findOne(
        { email: email.toLowerCase() },
        "_id email",
      );
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json([user]);
    }
    const users = await User.find({}, "_id email");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

/* GitHub OAuth Get URL */
router.get("/github/url", (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo user:email`;
  res.json({ url });
});

/* GitHub OAuth Callback */
router.post("/github/callback", async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Code is required" });

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } },
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res
        .status(400)
        .json({ error: "Failed to obtain access token from GitHub" });
    }

    const emailsResponse = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const primaryEmailObj =
      emailsResponse.data.find((e) => e.primary) || emailsResponse.data[0];
    if (!primaryEmailObj) {
      return res
        .status(400)
        .json({ error: "No email found in GitHub account" });
    }
    const email = primaryEmailObj.email.toLowerCase();

    let user = await User.findOne({ email });
    if (user) {
      user.githubAccessToken = accessToken;
      await user.save();
    } else {
      user = new User({ email, githubAccessToken: accessToken });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({ token, email: user.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
