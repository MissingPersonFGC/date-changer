(function() {
  "use strict";
  const config = {};
  const courseRegex = new RegExp(
    "^/courses/(\\d+)/(assignments|quizzes|discussion_topics)(?:/(\\d+))?"
  );
  const courseMatch = courseRegex.exec(window.location.pathname);
  if (!courseMatch) {
    return;
  }

  const courseId = courseMatch[1];
  const contextType = courseMatch[2];
  const contextId =
    typeof courseMatch[3] === "undefined" ? false : courseMatch[3];

  function getCookie(name) {
    return document.cookie.split(";").reduce(function(a, c) {
      const d = c.trim().split("=", 2);
      return d[0] === name ? decodeURIComponent(d[1]) : a;
    }, "");
  }
});
