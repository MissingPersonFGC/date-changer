const express = require("express");
const mongoose = require("mongoose");
const { router: courseRouter } = require("./_routes/courseRoute");
const { MONGODB_URI } = process.env;

mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

const app = express();

app.use("/api/courses", courseRouter);

module.exports = app;
