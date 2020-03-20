const express = require("express");
const router = express.Router();
const axios = require("axios");

router.route("/").get(async (req, res) => {
  const { apiKey: access_token, course } = req.query;
  try {
    const results = await axios({
      method: "GET",
      url: `https://canvas.instructure.com/api/v1/courses/${course}/assignments`,
      headers: {
        Accept: "application/json+canvas-string-ids"
      },
      params: {
        access_token,
        per_page: 100,
        include: ["overrides", "observed_users"],
        order_by: "position"
      }
    });
    const regex = /([A-Za-z\s])/;
    const assignments = [];
    results.data.forEach(assignment => {
      if (!regex.test(assignment.name.charAt(0))) {
        assignments.push(assignment);
      }
    });
    assignments.sort((x, y) => x.name.localeCompare(y.name));
    res.status(200).json({
      assignments
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.route("/").put(async (req, res) => {
  const {
    apiKey: access_token,
    assignment,
    override,
    course,
    extension,
    students
  } = req.body;
  try {
    if (!override) {
      const result = await axios({
        method: "PUT",
        url: `https://canvas.instructure.com/api/v1/courses/${course}/assignments/${assignment.id}`,
        params: {
          access_token,
          assignment: {
            due_at: assignment.due_at,
            lock_at: assignment.lock_at,
            unlock_at: assignment.lock_at
          }
        }
      });
      res.status(201).json({
        data: result
      });
    } else {
      const title = `Course Extension Date - ${Date.now()}`;
      const result = await axios({
        method: "POST",
        url: `https://canvas.instructure.com/api/v1/courses/${course}/assignments/${assignment.id}/overrides`,
        params: {
          access_token,
          assignment_override: {
            student_ids: students,
            title,
            due_at: extension,
            lock_at: extension
          }
        }
      });
      res.status(201).json({
        data: result
      });
    }
  } catch (e) {
    res.status(401).send(e);
  }
});

exports.router = router;
