var express = require("express");
var router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const { sendOtpEmail } = require("../utils/mailer");

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* Send OTP */
router.post("/send-otp", async function (req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const otp = generateOTP();
    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      user.verificationCode = otp;
      user.verificationCodeExpires = expiresAt;
      await user.save();
    } else {
      user = new User({
        email: email.toLowerCase(),
        verificationCode: otp,
        verificationCodeExpires: expiresAt,
      });
      await user.save();
    }

    // Send the email
    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    next(err);
  }
});

/* Verify OTP */
router.post("/verify-otp", async function (req, res, next) {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res
        .status(400)
        .json({ error: "Email and verification code are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.verificationCode !== code) {
      return res.status(401).json({ error: "Invalid verification code" });
    }

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date()) {
      return res.status(401).json({ error: "Verification code has expired" });
    }

    // Code is valid, clear the OTP fields
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );

    res.json({ token, email: user.email });
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
