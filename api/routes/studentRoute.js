const express = require('express');
const router = express.Router();
const axios = require('axios');

router.route('/').get(async (req, res) => {
  const { access_token, course } = req.query;
  try {
    const results = await axios({
      method: "GET",
      url: `https://canvas.instructure.com/api/v1/courses/${course}/students`,
      headers: {
        Accept: "application/json+canvas-string-ids"
      },
      params: {
        access_token
        per_page: 100
      }
    });
    res.status(200).json({
      data: [...result.data]
    });
  } catch (e) {
    res.status(400).send(e);
  }
})

exports.router = router;
