const express = require("express");
const mongoose = require("mongoose");
const { router: userRouter } = require("./_routes/userRoute");
const { MONGODB_URI } = process.env;

mongoose.connect(MONGODB_URI);
mongoose.Promise = global.Promise;

const app = express();

app.use("/api/users", userRouter);

module.exports = app;
