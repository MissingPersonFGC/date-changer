"use strict";
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

const router = express();

const middleWare = require("./middleware");

const { applyMiddleware } = require("./utils");
const { PORT, MONGODB_URI } = require("./utils/constants");

const { router: courseRouter } = require("./routes/courseRoute");
const { router: moduleRouter } = require("./routes/moduleRoute");
const { router: itemRouter } = require("./routes/itemRoute");
const { router: assignmentRouter } = require('./routes/assignmentRoute');
const { router: studentRouter } = require('./routes/studentRoute');

// import routers above this line
applyMiddleware(middleWare, router);
// use routes below this line

router.use("/api/courses", courseRouter);
router.use("/api/modules", moduleRouter);
router.use("/api/item", itemRouter);
router.use("/api/assignments", assignmentRouter);
router.use('/api/students', studentRouter);

const server = http.createServer(router);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log(err);
  });
