require("dotenv").config();

const seedDatabase = require("./utils/seed");

const authMiddleware = require("./middleware/auth");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var boardRouter = require("./routes/boards");
var invitationsRouter = require("./routes/invitations");
var authRouter = require("./routes/auth");
var repositoriesRouter = require("./routes/repositories");

seedDatabase();

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/auth", authMiddleware, authRouter);
app.use("/invitations", authMiddleware, invitationsRouter);
app.use("/repositories", authMiddleware, repositoriesRouter);

// Since cards and tasks route are nested under boards, we only need to use board router
app.use("/boards", authMiddleware, boardRouter);

module.exports = app;
