const express = require("express");
const router = express.Router();
const axios = require("axios");
const middleWare = require("../_middleware");
const { applyMiddleware } = require("../_utils");

applyMiddleware(middleWare, router);

router.route("/").get(async (req, res) => {
  const { apiKey: access_token } = req.query;
  try {
    const courses = [];
    const result = await axios({
      method: "GET",
      url: "https://canvas.instructure.com/api/v1/courses",
      headers: {
        Accept: "application/json+canvas-string-ids",
      },
      params: {
        access_token,
        per_page: 100,
        state: ["available", "unpublished"],
      },
    });
    result.data.forEach((course) => {
      courses.push(course);
    });
    if (result.data.length === 100) {
      let currentPage = 2;
      async function apiPagination() {
        console.log("running");
        const courseRes = await axios({
          method: "GET",
          url: "https://canvas.instructure.com/api/v1/courses",
          headers: {
            Accept: "application/json+canvas-string-ids",
          },
          params: {
            access_token,
            per_page: 100,
            state: ["available", "unpublished"],
            page: currentPage,
          },
        });
        console.log(courseRes.data);
        courseRes.data.forEach((course) => {
          courses.push(course);
        });
        if (courseRes.data.length === 100) {
          console.log("10/10 would run again");
          currentPage += 1;
          await apiPagination();
        } else {
          console.log("0/10 avoid running");
        }
      }
      await apiPagination();
    }
    res.status(200).json({
      data: [...courses],
    });
  } catch (e) {
    res.status(400);
  }
});

exports.router = router;
