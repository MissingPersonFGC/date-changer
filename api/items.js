const express = require("express");
const mongoose = require("mongoose");
const { router: itemRouter } = require("./_routes/itemRoute");
const { MONGODB_URI } = process.env;

mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

const app = express();

app.use("/api/items", itemRouter);

module.exports = app;
