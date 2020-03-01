const express = require("express");
const router = express.Router();
const teacherService = require("../services/teacherService");

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

exports.router = router;
