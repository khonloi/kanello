const mongoose = require("mongoose");

const authMiddleware = require("./middleware/auth");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var boardRouter = require("./routes/boards");
var authRouter = require("./routes/auth");
var invitationsRouter = require("./routes/invitations");

mongoose
  .connect("mongodb://localhost:27017/kanello")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authRouter);
app.use("/invitations", authMiddleware, invitationsRouter);

// Since cards and tasks route are nested under boards, we only need to use board router
app.use("/boards", authMiddleware, boardRouter);

module.exports = app;
