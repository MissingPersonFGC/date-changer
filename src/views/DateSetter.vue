<template>
  <div class="date-setter">
    <div
      class="loading"
      v-if="loading"
      :aria-busy="loading"
    ></div>
    <h1>Assignment Date Editor</h1>
    <div class="selection">
      <p
        v-if="success"
        class="success"
        id="success"
      >
        Assignments successfully updated.
      </p>
      <p
        v-if="error"
        class="error"
        id="error"
      >
        <span>Error:</span> {{ error }}
      </p>
      <p>
        <input
          type="checkbox"
          v-model="auditAssNums"
          :disabled="startDate !== '' || (setExtension && teacher !== '' && course !=='')"
        /> Run report of total
        number of assignments, tests, and quizzes.
      </p>
      <p v-if="!auditAssNums">
        <input
          type="checkbox"
          v-model="bypassPermZero"
          :disabled="startDate !== '' || (setExtension && teacher !== '' && course !=='')"
        />
        Bypass assigning permanent zero dates
      </p>
      <p v-if="!auditAssNums">
        <input
          type="checkbox"
          v-model="setExtension"
        />
        Set course extension dates.
      </p>
      <label v-if="!auditAssNums && !setExtension">Upload holiday calendar:</label>
      <input
        type="file"
        @change="parseCSV"
        multiple="false"
        accept=".csv"
        v-if="!auditAssNums && !setExtension"
      />
      <div
        class="date-grid"
        v-if="!auditAssNums && !setExtension"
      >
        <div>
          <p>Access date:</p>
          <datetime
            week-start=7
            type="date"
            v-model="startDate"
            zone="Asia/Dubai"
            value-zone="Asia/Dubai"
            input-id="course-start-date"
          />
        </div>
        <div>
          <p>Last date to submit work:</p>
          <datetime
            week-start=7
            type="date"
            v-model="endDate"
            zone="Asia/Dubai"
            value-zone="Asia/Dubai"
            input-id="course-end-date"
          />
        </div>
      </div>
      <p v-if="(startDate !== '' && endDate !== '') || auditAssNums || setExtension">
        Select a teacher:
      </p>
      <v-select
        label="fullName"
        :options="teachers"
        @input="setTeacher"
        v-if="(startDate !== '' && endDate !== '') || auditAssNums || setExtension"
      ></v-select>

      <p v-if="teacher !== '' && courses.length > 0">Select a course:</p>
      <v-select
        v-if="teacher !== '' && courses.length > 0"
        label="fullName"
        :options="courses"
        @input="setCourse"
      ></v-select>
    </div>
    <div
      class="assignments"
      v-if="course !== ''"
    >
      <h2>Assignments</h2>
      <h3>Grand Total of Assignments: {{ assignments.length }}</h3>
      <h3>Number of Assignments & Discussions: {{ assignmentTotal }}</h3>
      <h3>Number of Tests & Quizzes: {{ quizTotal }}</h3>
      <p v-if="!setExtension && !auditAssNums">
        Please review the assignments below and make sure that the dates are
        correct. Also, set the due date and end date for the semester exam
        before submitting the dates.
      </p>
      <p
        class="notice"
        v-if="!setExtension && !auditAssNums"
      >
        <span>NOTE:</span> The submit button will NOT enable until you have
        manually set the due and end date for the semester exam, and checked the
        box above the submit button.
      </p>
      <div
        class="set-extension"
        v-if="!auditAssNums"
      >
        <div
          v-if="setExtension"
          class="select-student"
        >
          <div class="set-extension">
            <p>Available from date (course start date):</p>
            <datetime
              type="date"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              input-id="course-extension-date"
              week-start=7
              v-model="extensionStart"
            />
          </div>
          <div class="set-extension">
            <p>Extension end date:</p>
            <datetime
              type="date"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              input-id="course-extension-date"
              week-start=7
              v-model="extension"
            />
          </div>
          <p>Select student(s):</p>
          <div class="student-grid">
            <div
              class="student"
              v-for="student in students"
              :key="student.id"
            >
              <input
                type="checkbox"
                :value="student.id"
                v-model="selectedStudents"
              />
              {{ student.sortable_name }}
            </div>
          </div>
          <button
            class="submit"
            @click.prevent="submitDates"
          >
            Submit Extension
          </button>
        </div>
      </div>
      <div
        class="grid-container"
        v-if="!setExtension && !auditAssNums"
      >
        <div class="grid grid-header">
          <div class="name">Assignment Name:</div>
          <div class="unlock">Start Date:</div>
          <div class="due">Due Date:</div>
          <div class="permanent-zero">End Date:</div>
        </div>
        <div
          class="grid"
          v-for="assignment in assignments"
          :key="assignment.id"
        >
          <div class="name">{{ assignment.name }}</div>
          <div class="unlock">
            <datetime
              week-start=7
              type="date"
              v-model="assignment.unlock_at"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              :input-id="assignment.id + '-unlock-date'"
            />
          </div>
          <div class="due">
            <datetime
              week-start=7
              type="date"
              v-model="assignment.due_at"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              :input-id="assignment.id + '-due-date'"
            />
          </div>
          <div class="permanent-zero">
            <datetime
              week-start=7
              type="date"
              v-model="assignment.lock_at"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              :input-id="assignment.id + '-lock-date'"
            />
          </div>
        </div>
      </div>
      <p
        class="agreement"
        v-if="!setExtension && !auditAssNums"
      >
        <input
          type="checkbox"
          v-model="acknowledgeNotice"
        />
        I acknowledge that I have checked <span>all</span> start dates, due
        dates, and end dates on each assignment.
        <span class="extraemphasis">I have also manually set the due and end dates on the semester
          exam.</span>
      </p>
      <button
        class="submit"
        @click.prevent="submitDates"
        v-if="!setExtension && !auditAssNums"
        :disabled="!acknowledgeNotice"
      >
        Submit Dates
      </button>
    </div>
  </div>
</template>

<script>
import "vue-datetime/dist/vue-datetime.css";
import "vue-select/dist/vue-select.css";
import axios from "axios";
import { Settings } from "luxon";

export default {
  name: "date-setter",
	props: {
		darkMode: String,
	},
  data() {

    return {
      teachers: [],
      teacher: "",
      courses: [],
      course: "",
      assignments: [],
      setExtension: false,
      students: [],
      loading: false,
      error: null,
      success: false,
      selectedStudents: [],
      startDate: "",
      endDate: "",
      extension: "",
      holidays: [],
      acknowledgeNotice: false,
      quizTotal: 0,
      assignmentTotal: 0,
      bypassPermZero: false,
      auditAssNums: false,
      allCourses: [],
      extensionStart: ""
    };
  },
  mounted: async function() {
    const teachers = await axios({
      method: "GET",
      url: "/api/teachers/"
    });
    teachers.data.data.forEach(teacher => {
      teacher.fullName = `${teacher.lastName}, ${teacher.firstName} (${teacher.designation})`;
    });
    this.teachers = teachers.data.data;
  },
  methods: {
    setTeacher: async function(e) {
      this.loading = true;
      this.success = false;
      this.error = null;
      const { apiKey } = e;
      this.teacher = apiKey;
      try {
        const res = await axios({
          method: "GET",
          url: "/api/courses",
          params: {
            apiKey
          }
        });
        const courses = [];
        res.data.data.forEach(course => {
          course.fullName = `${course.name} (${course.term.name})`;
          courses.push(course);
        });
        this.loading = false;
        this.courses = courses;
        // this.allCourses = res.data.data;
        // this.sortCourses();
      } catch (e) {
        this.loading = false;
        this.error = e.message;
      }
    },
    sortCourses: function() {
      const { setExtension, allCourses, auditAssNums } = this.$data;
      if (allCourses.length > 0) {
        if (!setExtension && auditAssNums) {
          this.courses = allCourses;
        } else if (!setExtension && !auditAssNums) {
          const courses = [];
          allCourses.forEach(course => {
            if (course.workflow_state === "unpublished") {
              courses.push(course);
            }
          });
          this.courses = courses;
        } else {
          const courses = [];
          allCourses.forEach(course => {
            if (course.workflow_state === "available") {
              courses.push(course);
            }
          });
          this.courses = courses;
        }
      }
    },
    setCourse: async function(e) {
      this.error = null;
      const {
        teacher,
        startDate,
        endDate,
        dueDateLimit,
        holidays,
        bypassPermZero,
        auditAssNums,
        setExtension
      } = this.$data;
      const { id } = e;
      this.loading = true;
      const calculateDateSpan = (start, end) => {
        const dt1 = new Date(start);
        const dt2 = new Date(end);
        return Math.floor(
          (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
            Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
            (1000 * 60 * 60 * 24)
        );
      };
      const availableDates = [];
      for (
        let i = new Date(startDate);
        i <= new Date(endDate);
        i.setDate(i.getDate() + 1)
      ) {
        const thisDate = i.toLocaleString("en-US", {
          timeZone: "Asia/Dubai",
          weekday: "long",
          year: "numeric",
          day: "numeric",
          month: "numeric"
        });
        if (
          thisDate.indexOf("Friday") !== -1 ||
          thisDate.indexOf("Saturday") !== -1
        ) {
          const arr = thisDate.split(" ");
          const dateArr = arr[1].split("/");
          if (dateArr[0].length === 1) {
            dateArr[0] = `0${dateArr[0]}`;
          }
          if (dateArr[1].length === 1) {
            dateArr[1] = `0${dateArr[1]}`;
          }
          const formattedDate = `${dateArr[2]}-${dateArr[0]}-${dateArr[1]}T00:00:00.000+04:00`;
          const index = holidays.findIndex(x => x === formattedDate);
          if (index === -1) {
            holidays.push(formattedDate);
          }
        } else {
          const arr = thisDate.split(" ");
          const dateArr = arr[1].split("/");
          if (dateArr[0].length === 1) {
            dateArr[0] = `0${dateArr[0]}`;
          }
          if (dateArr[1].length === 1) {
            dateArr[1] = `0${dateArr[1]}`;
          }
          const formattedDate = `${dateArr[2]}-${dateArr[0]}-${dateArr[1]}T00:00:00.000+04:00`;
          const index = holidays.findIndex(x => x === formattedDate);
          if (index === -1) {
            availableDates.push(formattedDate);
          }
        }
      }
      holidays.sort((x, y) => {
        return x < y;
      });
      this.holidays = holidays;
      const holidaysMidPoint = [];
      holidays.forEach(holiday => {
        const dt1 = new Date(startDate);
        const dt2 = new Date(holiday);
        const dt3 = new Date(endDate);
        if (
          Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) >=
            Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) &&
          Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) <=
            Date.UTC(dt3.getFullYear(), dt3.getMonth(), dt3.getDate())
        ) {
          holidaysMidPoint.push(holiday);
        }
      });
      try {
        const res = await axios({
          method: "GET",
          url: "/api/assignments",
          params: {
            apiKey: teacher,
            course: id
          }
        });
        const studentRes = await axios({
          method: "Get",
          url: "/api/students",
          params: {
            apiKey: teacher,
            course: id
          }
        });
        const assignments = [];
        let assignmentTotal = 0;
        let quizTotal = 0;
        res.data.assignments.forEach(assignment => {
          assignment.old_unlock_at = assignment.unlock_at;
          assignment.unlock_at = startDate;
          assignment.old_due_at = assignment.due_at;
          assignment.old_lock_at = assignment.lock_at;
          assignments.push(assignment);
          if (assignment.is_quiz_assignment) {
            quizTotal += 1;
          } else {
            assignmentTotal += 1;
          }
        });
        if (setExtension) {
          this.assignments = res.data.assignments;
          this.students = studentRes.data.students;
          this.course = id;
          this.loading = false;
          return;
        }
        if (!auditAssNums) {
          let moreAssignments = false;
          const { students } = studentRes.data;
          const totalAssignments = assignments.length;
          if (totalAssignments - (availableDates.length - 1) > 0) {
            moreAssignments = true;
          }
          if (!moreAssignments) {
            const flooredInterval = Math.floor(
              (availableDates.length - 1) / totalAssignments
            );
            const ceiledInterval = Math.ceil(
              (availableDates.length - 1) / totalAssignments
            );
            const rawInterval = (availableDates.length - 1) / totalAssignments;
            let flooredDeviation;
            let ceiledDeviation;
            let numFlooredAss;
            let numCeiledAss;
            if (
              ceiledInterval - rawInterval < 0.2 &&
              ceiledInterval - rawInterval > 0.1
            ) {
              flooredDeviation = ceiledInterval - rawInterval;
              ceiledDeviation = rawInterval - flooredInterval;
              numFlooredAss = Math.floor(totalAssignments * flooredDeviation);
              numCeiledAss = Math.ceil(totalAssignments * ceiledDeviation);
            } else if (ceiledInterval - rawInterval > 0.2) {
              flooredDeviation = rawInterval - flooredInterval;
              ceiledDeviation = ceiledInterval - rawInterval;
              numFlooredAss = Math.ceil(totalAssignments * ceiledDeviation);
              numCeiledAss = Math.floor(totalAssignments * flooredDeviation);
            } else {
              flooredDeviation = ceiledInterval - rawInterval;
              ceiledDeviation = rawInterval - flooredInterval;
              numFlooredAss = Math.ceil(totalAssignments * flooredDeviation);
              numCeiledAss = Math.floor(totalAssignments * ceiledDeviation);
            }
            const intervalArr = [
              Math.ceil((availableDates.length - 1) / totalAssignments),
              Math.floor((availableDates.length - 1) / totalAssignments)
            ];
            let intervalIndex = 0;
            let currentDate = new Date(startDate);
            let dateIndex = 0;
            let repeatDate = false;
            for (let i = 0; i < totalAssignments; i++) {
              const assignPermanentZero = (int, date) => {
                if (!bypassPermZero) {
                  let permZeroDate = new Date(date);
                  permZeroDate.setDate(permZeroDate.getDate() + int);
                  const difference = calculateDateSpan(permZeroDate, endDate);
                  if (difference <= 0 || assignments[i].is_quiz_assignment) {
                    const dt = new Date(endDate);
                    const formatted = dt.toLocaleString("en-US", {
                      timeZone: "Asia/Dubai",
                      year: "numeric",
                      day: "numeric",
                      month: "numeric"
                    });
                    const dtArr = formatted.split("/");
                    if (dtArr[0].length === 1) {
                      dtArr[0] = `0${dtArr[0]}`;
                    }
                    if (dtArr[1].length === 1) {
                      dtArr[1] = `0${dtArr[1]}`;
                    }
                    const formattedPermZero = `${dtArr[2]}-${dtArr[0]}-${dtArr[1]}T23:59:00.000+04:00`;
                    assignments[i].lock_at = formattedPermZero;
                  } else {
                    const formZeroDate = permZeroDate.toLocaleString("en-US", {
                      timeZone: "Asia/Dubai",
                      year: "numeric",
                      day: "numeric",
                      month: "numeric"
                    });
                    const arr1 = formZeroDate.split("/");
                    if (arr1[0].length === 1) {
                      arr1[0] = `0${arr1[0]}`;
                    }
                    if (arr1[1].length === 1) {
                      arr1[1] = `0${arr1[1]}`;
                    }
                    const earlyFormat = `${arr1[2]}-${arr1[0]}-${arr1[1]}T00:00:00.000+04:00`;
                    const permZeroIndex = holidays.findIndex(
                      x => x === earlyFormat
                    );
                    if (permZeroIndex !== -1) {
                      assignPermanentZero(int + 1, date);
                    } else {
                      const arr = formZeroDate.split("/");
                      if (arr[0].length === 1) {
                        arr[0] = `0${arr[0]}`;
                      }
                      if (arr[1].length === 1) {
                        arr[1] = `0${arr[1]}`;
                      }
                      const formattedPermZero = `${arr[2]}-${arr[0]}-${arr[1]}T23:59:00.000+04:00`;
                      assignments[i].lock_at = formattedPermZero;
                    }
                  }
                } else {
                  const dt = new Date(endDate);
                  const formatted = dt.toLocaleString("en-US", {
                    timeZone: "Asia/Dubai",
                    year: "numeric",
                    day: "numeric",
                    month: "numeric"
                  });
                  const dtArr = formatted.split("/");
                  if (dtArr[0].length === 1) {
                    dtArr[0] = `0${dtArr[0]}`;
                  }
                  if (dtArr[1].length === 1) {
                    dtArr[1] = `0${dtArr[1]}`;
                  }
                  const formattedPermZero = `${dtArr[2]}-${dtArr[0]}-${dtArr[1]}T23:59:00.000+04:00`;
                  assignments[i].lock_at = formattedPermZero;
                }
              };
              const assignDates = int => {
                dateIndex = dateIndex + int;
                const arr = availableDates[dateIndex].split("T");
                const formattedDate = `${arr[0]}T23:59:00.000+04:00`;
                assignments[i].due_at = formattedDate;
                assignPermanentZero(30, formattedDate);
              };
              if (numFlooredAss === 0) {
                assignDates(ceiledInterval);
                numCeiledAss -= 1;
              } else if (numCeiledAss === 0) {
                assignDates(flooredInterval);
                numFlooredAss -= 1;
              } else {
                assignDates(intervalArr[intervalIndex]);
                if (intervalIndex === 0) {
                  intervalIndex = 1;
                  numCeiledAss -= 1;
                } else {
                  intervalIndex = 0;
                  numFlooredAss -= 1;
                }
              }
            }
          } else {
            const rawInterval = totalAssignments / (availableDates.length - 1);
            let floorInterval = Math.floor(
              totalAssignments / (availableDates.length - 1)
            );
            let ceilInterval = Math.ceil(
              totalAssignments / (availableDates.length - 1)
            );
            let dateIndex = 1;
            let amountRemaining;
            let nextAssign;
            if (ceilInterval - rawInterval > 0.5) {
              amountRemaining = floorInterval;
              nextAssign = "ceil";
            } else {
              amountRemaining = ceilInterval;
              nextAssign = "floor";
            }
            let floorLoops = 0;
            let ceilLoops = 0;
            const loopQuantities = (remaining, assign, total) => {
              if (assign === "ceil") {
                floorLoops += 1;
                if (total + remaining < totalAssignments) {
                  loopQuantities(ceilInterval, "floor", total + remaining);
                }
              } else {
                ceilLoops += 1;
                if (total + remaining < totalAssignments) {
                  loopQuantities(floorInterval, "ceil", total + remaining);
                }
              }
            };
            if (nextAssign === "ceil") {
              loopQuantities(floorInterval, "ceil", 0);
            } else {
              loopQuantities(ceilInterval, "floor", 0);
            }
            const dateGap = floorLoops + ceilLoops - availableDates.length - 1;
            const assignGap =
              floorLoops * floorInterval +
              ceilLoops * ceilInterval -
              totalAssignments;
            let extraCeil;
            if (ceilInterval - rawInterval > 0.9) {
              ceilInterval = floorInterval;
            }
            if ((availableDates.length - 1) / totalAssignments > 0.9) {
              extraCeil = 0;
            } else {
              if (ceilInterval - rawInterval > 0.3) {
                extraCeil = Math.ceil(ceilLoops * (ceilInterval - rawInterval));
                if (assignGap + dateGap === 1) {
                  extraCeil += 1;
                }
              } else {
                extraCeil = 11;
              }
            }
            const initialExtra = extraCeil;
            let timesRan = 0;
            if (initialExtra > 0) {
              amountRemaining = ceilInterval;
            }
            const assignPermanentZero = (int, date, i) => {
              if (!bypassPermZero) {
                let permZeroDate = new Date(date);
                permZeroDate.setDate(permZeroDate.getDate() + int);
                const difference = calculateDateSpan(permZeroDate, endDate);
                if (difference <= 0 || assignments[i].is_quiz_assignment) {
                  const dt = new Date(endDate);
                  const formatted = dt.toLocaleString("en-US", {
                    timeZone: "Asia/Dubai",
                    year: "numeric",
                    day: "numeric",
                    month: "numeric"
                  });
                  const dtArr = formatted.split("/");
                  if (dtArr[0].length === 1) {
                    dtArr[0] = `0${dtArr[0]}`;
                  }
                  if (dtArr[1].length === 1) {
                    dtArr[1] = `0${dtArr[1]}`;
                  }
                  const formattedPermZero = `${dtArr[2]}-${dtArr[0]}-${dtArr[1]}T23:59:00.000+04:00`;
                  assignments[i].lock_at = formattedPermZero;
                } else {
                  const formZeroDate = permZeroDate.toLocaleString("en-US", {
                    timeZone: "Asia/Dubai",
                    year: "numeric",
                    day: "numeric",
                    month: "numeric"
                  });
                  const arr1 = formZeroDate.split("/");
                  if (arr1[0].length === 1) {
                    arr1[0] = `0${arr1[0]}`;
                  }
                  if (arr1[1].length === 1) {
                    arr1[1] = `0${arr1[1]}`;
                  }
                  const earlyFormat = `${arr1[2]}-${arr1[0]}-${arr1[1]}T00:00:00.000+04:00`;
                  const permZeroIndex = holidays.findIndex(
                    x => x === earlyFormat
                  );
                  if (permZeroIndex !== -1) {
                    assignPermanentZero(int + 1, date, i);
                  } else {
                    const arr = formZeroDate.split("/");
                    if (arr[0].length === 1) {
                      arr[0] = `0${arr[0]}`;
                    }
                    if (arr[1].length === 1) {
                      arr[1] = `0${arr[1]}`;
                    }
                    const formattedPermZero = `${arr[2]}-${arr[0]}-${arr[1]}T23:59:00.000+04:00`;
                    assignments[i].lock_at = formattedPermZero;
                  }
                }
              } else {
                const dt = new Date(endDate);
                const formatted = dt.toLocaleString("en-US", {
                  timeZone: "Asia/Dubai",
                  year: "numeric",
                  day: "numeric",
                  month: "numeric"
                });
                const dtArr = formatted.split("/");
                if (dtArr[0].length === 1) {
                  dtArr[0] = `0${dtArr[0]}`;
                }
                if (dtArr[1].length === 1) {
                  dtArr[1] = `0${dtArr[1]}`;
                }
                const formattedPermZero = `${dtArr[2]}-${dtArr[0]}-${dtArr[1]}T23:59:00.000+04:00`;
                assignments[i].lock_at = formattedPermZero;
              }
            };
            const assignDates = i => {
              const arr = availableDates[dateIndex].split("T");
              const formattedDate = `${arr[0]}T23:59:00.000+04:00`;
              assignments[i].due_at = formattedDate;
              amountRemaining -= 1;
              if (initialExtra > 0) {
                if (amountRemaining === 0) {
                  if (extraCeil > 0) {
                    amountRemaining = ceilInterval;
                    extraCeil -= 1;
                  } else if (
                    nextAssign === "ceil" &&
                    timesRan === extraCeil * ceilInterval
                  ) {
                    amountRemaining = ceilInterval;
                  } else if (
                    nextAssign === "floor" &&
                    timesRan === extraCeil * ceilInterval
                  ) {
                    amountRemaining = floorInterval;
                  } else if (nextAssign === "floor") {
                    amountRemaining = floorInterval;
                    nextAssign = "ceil";
                  } else {
                    amountRemaining = ceilInterval;
                    nextAssign = "floor";
                  }
                  timesRan += 1;
                  if (dateIndex !== availableDates.length - 1) {
                    dateIndex += 1;
                  }
                }
              } else {
                if (nextAssign === "floor") {
                  amountRemaining = floorInterval;
                  nextAssign = "ceil";
                } else {
                  amountRemaining = ceilInterval;
                  nextAssign = "floor";
                }
                timesRan += 1;
                if (dateIndex !== availableDates.length - 1) {
                  dateIndex += 1;
                }
              }
              assignPermanentZero(30, formattedDate, i);
            };
            for (let i = 0; i < totalAssignments; i++) {
              assignDates(i);
            }
          }
          this.students = students;
        }
        this.course = id;
        this.loading = false;
        this.assignments = assignments;
        this.quizTotal = quizTotal;
        this.assignmentTotal = assignmentTotal;
      } catch (e) {
        this.loading = false;
        this.error = e.message;
        console.error(e);
      }
    },
    submitDates: async function() {
      this.loading = true;
      this.error = null;
      this.success = false;
      let putError = false;
      const {
        teacher: apiKey,
        course,
        setExtension,
        assignments,
        selectedStudents,
        extension: extensionDate,
        extensionStart
      } = this.$data;
      const user = localStorage.getItem("icadDateId");
      const teacherIndex = this.$data.teachers.findIndex(
        x => x.apiKey === apiKey
      );
      const courseIndex = this.$data.courses.findIndex(x => x.id === course);

      // TODO: This is the code for submitting the API PUT request to Canvas servers. Whenever they fix their issues with the endpoint, this should be uncommented. The code below this block handles creating the CSV file for manipulation in the Google Sheet macro.
      // try {
      //   if (!setExtension) {
      //     await assignments.forEach(async assignment => {
      //       if (!putError) {
      //         const index = assignment.due_at.indexOf("T23:59:00.000+04:00");
      //         const index2 = assignment.lock_at.indexOf("T23:59:00.000+04:00");
      //         if (index === -1) {
      //           const arr = assignment.due_at.split("T");
      //           assignment.due_at = `${arr[0]}T23:59:00.000+04:00`;
      //         }
      //         if (index2 === -1) {
      //           const arr = assignment.lock_at.split("T");
      //           assignment.lock_at = `${arr[0]}T23:59:00.000+04:00`;
      //         }
      //         await axios
      //           .put("/api/assignments", {
      //             data: {
      //               apiKey,
      //               course,
      //               assignment,
      //               user,
      //               teacher: this.$data.teachers[teacherIndex]._id,
      //               courseName: this.$data.courses[courseIndex].name
      //             }
      //           })
      //           .then(res => {
      //             console.log(res.data.data);
      //           })
      //           .catch(err => {
      //             putError = true;
      //             console.error(err);
      //             this.loading = false;
      //             this.error = err.message;
      //             window.location.href = "#error";
      //           });
      //       }
      //     });
      //     if (!putError) {
      //       this.loading = false;
      //       this.success = true;
      //     }
      //   } else {
      //   }
      // } catch (e) {
      //   this.loading = false;
      //   this.error = e.message;
      //   window.location.href = "#error";
      // }
      if (!setExtension) {
        // create the CSV file with headers
        const csv = [["Title", "Due", "Available from", "Available until"]];
        // create the file name
        const fileName = `${this.$data.courses[courseIndex].name} - ${this.$data.teachers[teacherIndex].fullName}`;

        assignments.forEach(assignment => {
          // format the dates for the csv
          const resetLockArr = assignment.lock_at.split("T");
          const lockDate = `${resetLockArr[0]}T23:59:00.000+04:00`;
          const resetDueArr = assignment.due_at.split("T");
          const dueDate = `${resetDueArr[0]}T23:59:00.000+04:00`;
          const resetUnlockArr = assignment.unlock_at.split("T");
          const unlockDate = `${resetUnlockArr[0]}T00:01:00.000+04:00`;
          const dtUnlock = new Date(unlockDate);
          const dtDue = new Date(dueDate);
          const dtLock = new Date(lockDate);
          const formDtUnlock = dtUnlock.toLocaleString("en-us", {
            timeStyle: "medium",
            dateStyle: "short",
            hour12: false
          });
          const unlockArr = formDtUnlock.split(", ");
          const unlockDateArr = unlockArr[0].split("/");
          if (unlockDateArr[0].length === 1) {
            unlockDateArr[0] = `0${unlockDateArr[0]}`;
          }
          if (unlockDateArr[1].length === 1) {
            unlockDateArr[1] = `0${unlockDateArr[1]}`;
          }
          let finalUnlockDate;
          if (unlockDateArr[2].length === 4) {
            finalUnlockDate = `${unlockDateArr[2]}-${unlockDateArr[0]}-${unlockDateArr[1]} ${unlockArr[1]}`;
          } else {
            finalUnlockDate = `20${unlockDateArr[2]}-${unlockDateArr[0]}-${unlockDateArr[1]} ${unlockArr[1]}`;
          }
          const formDtLock = dtLock.toLocaleString("en-us", {
            timeStyle: "medium",
            dateStyle: "short",
            hour12: false
          });
          const lockArr = formDtLock.split(", ");
          const lockDateArr = lockArr[0].split("/");
          if (lockDateArr[0].length === 1) {
            lockDateArr[0] = `0${lockDateArr[0]}`;
          }
          if (lockDateArr[1].length === 1) {
            lockDateArr[1] = `0${lockDateArr[1]}`;
          }
          let finalLockDate;
          if (lockDateArr[2].length === 4) {
            finalLockDate = `${lockDateArr[2]}-${lockDateArr[0]}-${lockDateArr[1]} ${lockArr[1]}`;
          } else {
            finalLockDate = `20${lockDateArr[2]}-${lockDateArr[0]}-${lockDateArr[1]} ${lockArr[1]}`;
          }
          const formDtDue = dtDue.toLocaleString("en-us", {
            timeStyle: "medium",
            dateStyle: "short",
            hour12: false
          });
          const dueArr = formDtDue.split(", ");
          const dueDateArr = dueArr[0].split("/");
          if (dueDateArr[0].length === 1) {
            dueDateArr[0] = `0${dueDateArr[0]}`;
          }
          if (dueDateArr[1].length === 1) {
            dueDateArr[1] = `0${dueDateArr[1]}`;
          }
          let finalDueDate;
          if (dueDateArr[2].length === 4) {
            finalDueDate = `${dueDateArr[2]}-${dueDateArr[0]}-${dueDateArr[1]} ${dueArr[1]}`;
          } else {
            finalDueDate = `20${dueDateArr[2]}-${dueDateArr[0]}-${dueDateArr[1]} ${dueArr[1]}`;
          }
          // check the assignment name for commas and remove all for proper csv formatting
          const newNameArr = [];
          for (let i = 0; i < assignment.name.length; i++) {
            if (assignment.name[i] !== ",") {
              newNameArr.push(assignment.name[i]);
            }
          }
          const newName = newNameArr.join("");
          const arr = [newName, finalDueDate, finalUnlockDate, finalLockDate];
          csv.push(arr);
        });
        let csvContent =
          "data:text/csv;charset=utf-8," + csv.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${fileName}.csv`);
        document.body.appendChild(link);
        link.click();
        this.loading = false;
        this.acknowledgeNotice = false;
      }
      if (setExtension) {
        const arr = extensionDate.split("T");
        const extension = `${arr[0]}T23:59:00+04:00`;
        assignments.forEach(assignment => {
          if (!putError) {
            axios
              .post("/api/assignments", {
                data: {
                  apiKey,
                  course,
                  assignment,
                  students: selectedStudents,
                  extension,
                  user,
                  teacher: this.$data.teachers[teacherIndex]._id,
                  courseName: this.$data.courses[courseIndex].name,
                  extensionStart
                }
              })
              .then(res => {
                console.log(res.data.data);
              })
              .catch(err => {
                putError = true;
                console.error(err);
                this.loading = false;
                this.error = err.message;
                window.location.href = "#error";
              });
          }
        });
        if (!putError) {
          this.loading = false;
          this.success = true;
          window.location.href = "#success";
        }
      }
    },
    parseCSV: async function(e) {
      const { files } = e.target || e.dataTransfer;
      const file = await files[0];
      let csvData;
      const reader = new FileReader();
      const promise = new Promise((resolve, reject) => {
        reader.onload = async e => {
          resolve((csvData = reader.result));
        };
        reader.readAsText(file);
      });
      promise
        .then(res => {
          const lines = csvData.split(/\r\n|\n/);
          lines.pop();
          const arr = [];
          lines.forEach(line => {
            const arr2 = line.split(",");
            arr.push(arr2);
          });
          const parsedArray = [];
          arr.forEach((line, index) => {
            if (index > 0) {
              const obj = {};
              line.forEach((item, index2) => {
                obj[`${arr[0][index2]}`] = item;
              });
              parsedArray.push(obj);
            }
          });
          const holidays = [];
          parsedArray.forEach(holiday => {
            holiday.date = `${holiday.date}T00:00:00.000+04:00`;
            holidays.push(holiday.date);
          });
          this.holidays = holidays;
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};
</script>

<style>
.date-setter {
  position: relative;
}
.selection {
  max-width: 640px;
  width: 100%;
  margin: 0 auto;
  text-align: left;
}
.assignments {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  text-align: left;
}

.grid-container {
  display: grid;
  grid-template-rows: 1fr;
  grid-gap: 10px;
}
.grid-container > .grid {
  display: grid;
  grid-gap: 10px;
  grid-template-columns: 7fr repeat(3, 1fr) !important;
}

.grid > div {
  border: 1px solid #2c3e50;
  padding: 10px 15px;
}

.grid:not(.grid-header) > div:not(.name) {
  padding: 0;
}
.grid-header {
  font-weight: bold;
}
.grid-header > div {
  background: #2c3e50;
  color: white;
}
.grid .vdatetime-input {
  width: 75% !important;
  padding: 12px 15px;
  border: 0;
}
.set-extension .vdatetime-input {
  padding: 12px 15px;
  border: 0;
}
.grid > div .vdatetime::parent {
  padding: 0;
}
button.submit {
  margin-top: 20px;
  background: #2c3e50;
  border: 0;
  border-radius: 5px;
  color: #ddf5ff;
  padding: 10px 15px;
  text-transform: uppercase;
  font-weight: bold;
  transition: all 0.5s ease-in-out;
}
button.submit:hover {
  background: #253d55;
  border-radius: 7px;
}
.set-extension {
  margin-bottom: 25px;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 10px;
}

.error span {
  color: red;
  font-weight: bold;
}

.date-grid {
  display: flex;
  justify-content: space-between;
}

p.notice {
  font-weight: bold;
}

p.notice span {
  color: orangered;
}

p.agreement {
  font-weight: bold;
}

p.agreement span:not(.extraemphasis) {
  text-transform: uppercase;
  text-decoration: underline;
}

p.agreement .extraemphasis {
  color: orangered;
}

@media (max-width: 1024px) {
  .grid-container > .grid {
    grid-template-columns: 3.5fr repeat(3, 1fr) !important;
  }
}
</style>
