const express = require("express");
const mongoose = require("mongoose");
const { router: moduleRouter } = require("./_routes/moduleRoute");
const { MONGODB_URI } = process.env;

mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

const app = express();

app.use("/api/modules", moduleRouter);

module.exports = app;
