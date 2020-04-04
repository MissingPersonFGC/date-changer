const express = require("express");
const router = express.Router();
const axios = require("axios");
const middleWare = require("../middleware");
const { applyMiddleware } = require("../utils");

applyMiddleware(middleWare, router);

router.route("/").get(async (req, res) => {
  const { apiKey: access_token, course } = req.query;
  try {
    const results = await axios({
      method: "GET",
      url: `https://canvas.instructure.com/api/v1/courses/${course}/users`,
      headers: {
        Accept: "application/json+canvas-string-ids"
      },
      params: {
        access_token,
        enrollment_type: ["student"],
        per_page: 100
      }
    });
    res.status(200).json({
      students: [...results.data]
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

exports.router = router;
