const express = require("express");
const router = express.Router();
const teacherService = require("../services/teacherService");
const middleWare = require("../middleware");
const { applyMiddleware } = require("../utils");

applyMiddleware(middleWare, router);

router.route("/bulk").post(async (req, res) => {
  const arr = req.body.teachers;
  try {
    const results = await teacherService.bulkAdd(arr);
    res.status(201).json({
      data: results
    });
  } catch (e) {
    res.status(401).send(e);
  }
});

router.route("/").get(async (_, res) => {
  try {
    const teachers = await teacherService.getAllTeachers();
    teachers.sort((a, b) => {
      return a.lastName.localeCompare(b.lastName);
    });
    res.status(200).json({
      data: teachers
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

exports.router = router;
