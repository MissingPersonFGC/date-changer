"use strict";
const express = require("express");
const http = require("http");

const router = express();

const middleWare = require("./middleware");

const { applyMiddleware } = require("./utils");

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

server.listen(4000, () => {
  console.log(`server running on port 4000`);
});
