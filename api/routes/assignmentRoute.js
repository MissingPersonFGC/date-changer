const express = require("express");
const router = express.Router();
const axios = require("axios");

router.route("/").get(async (req, res) => {
  const { apiKey: access_token, course } = req.query;
  try {
    const assignments = await axios({
      method: "GET",
      url: `https://canvas.instructure.com/api/v1/courses/${course}/assignments`,
      headers: {
        Accept: "application/json+canvas-string-ids"
      },
      params: {
        access_token,
        per_page: 100,
        include: [
          'overrides',
          'observed_users'
        ]
      }
    });
    res.status(200).json({
      assignments: [...assignments.data]
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

exports.router = router;
