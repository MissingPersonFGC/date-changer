"use strict";
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

const router = express();

const middleWare = require("./_middleware");

const { applyMiddleware } = require("./_utils");
const { PORT, MONGODB_URI } = require("./_utils/constants");

const { router: courseRouter } = require("./_routes/courseRoute");
const { router: moduleRouter } = require("./_routes/moduleRoute");
const { router: itemRouter } = require("./_routes/itemRoute");
const { router: assignmentRouter } = require("./_routes/assignmentRoute");
const { router: studentRouter } = require("./_routes/studentRoute");
const { router: userRouter } = require("./_routes/userRoute");
const { router: teacherRouter } = require("./_routes/teacherRoute");

// import routers above this line
applyMiddleware(middleWare, router);
// use routes below this line

router.use("/api/courses", courseRouter);
router.use("/api/modules", moduleRouter);
router.use("/api/item", itemRouter);
router.use("/api/assignments", assignmentRouter);
router.use("/api/students", studentRouter);
router.use("/api/users", userRouter);
router.use("/api/teachers", teacherRouter);

const server = http.createServer(router);

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
