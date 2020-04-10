const express = require("express");
const mongoose = require("mongoose");
const { router: assignmentRouter } = require("./_routes/assignmentRoute");
const { MONGODB_URI } = process.env;

mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

const app = express();

app.use("/api/assignments", assignmentRouter);

module.exports = app;
