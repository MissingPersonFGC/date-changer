(function() {
  "use strict";

  // first two should be true whenever you run this the first time on a course's gradebook. You should run it a second time with the first two false and the last one true to finalize the fixes.
  const config = {
    comment: true, // add comment showing permanent zero dates, do at the same time as the fix
    zero: true, // add temporary zero in order to fix the display of assignments in student gradebook
    reset: false // removes zeroes, but leaves comments. Make this true, and the others false on second pass.
  };

  const comment = date => {
    return `A score of zero will become permanent on ${date}. Please submit work before this date.`;
  };

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
