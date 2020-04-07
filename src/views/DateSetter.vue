<template>
  <div class="date-setter">
    <div
      class="loading"
      v-if="loading"
      :aria-busy="loading"
    ></div>
    <h1>Assignment Date Editor</h1>
    <div class="selection">
      <label>Upload holiday calendar:</label>
      <input
        type="file"
        @change="parseCSV"
        multiple="false"
        accept=".csv"
      />
      <p
        v-if="error"
        class="error"
      ><span>Error:</span> {{ error }}</p>
      <div class="date-grid">
        <div>
          <p>Access date:</p>
          <datetime
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
            type="date"
            v-model="endDate"
            zone="Asia/Dubai"
            value-zone="Asia/Dubai"
            input-id="course-end-date"
          />
        </div>
      </div>
      <p v-if="startDate !== '' && endDate !== ''">Select a teacher:</p>
      <v-select
        label="fullName"
        :options="teachers"
        @input="setTeacher"
        v-if="startDate !== '' && endDate !== ''"
      ></v-select>
      <p v-if="teacher !== '' && courses.length > 0">Select a course:</p>
      <v-select
        v-if="teacher !== '' && courses.length > 0"
        label="name"
        :options="courses"
        @input="setCourse"
      ></v-select>
    </div>
    <div
      class="assignments"
      v-if="course !== ''"
    >
      <h2>Assignments ({{assignments.length}} total)</h2>
      <p v-if="!setExtension">
        Please review the assignments below and make sure that the dates are correct. Also, set the due date and end date for the semester exam before submitting the dates.
      </p>
      <p
        class="notice"
        v-if="!setExtension"
      ><span>NOTE:</span> The submit button will NOT enable until you have manually set the due and end date for the semester exam, and checked the box above the submit button.</p>
      <div class="set-extension">
        <input
          type="checkbox"
          v-model="setExtension"
          name="setExtension"
        />
        <label for="setExtension">Set new end dates for students with an extension</label>
        <div
          v-if="setExtension"
          class="select-student"
        >
          <div class="set-extension">
            <p>Extension end date:</p>
            <datetime
              type="date"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              input-id="course-extension-date"
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
        v-if="!setExtension"
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
              type="date"
              v-model="assignment.unlock_at"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              :input-id="assignment.id + '-unlock-date'"
            />
          </div>
          <div class="due">
            <datetime
              type="date"
              v-model="assignment.due_at"
              zone="Asia/Dubai"
              value-zone="Asia/Dubai"
              :input-id="assignment.id + '-due-date'"
            />
          </div>
          <div class="permanent-zero">
            <datetime
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
        v-if="!setExtension"
      >
        <input
          type="checkbox"
          v-model="acknowledgeNotice"
        >
        I acknowledge that I have checked <span>all</span> start dates, due dates, and lock dates on each assignment. <span class="extraemphasis">I have also manually set the due and lock dates on the semester exam.</span>
      </p>
      <button
        class="submit"
        @click.prevent="submitDates"
        v-if="!setExtension"
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
      acknowledgeNotice: false
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
        this.loading = false;
        this.courses = res.data.data;
      } catch (e) {
        this.loading = false;
        this.error = e.message;
      }
    },
    setCourse: async function(e) {
      this.loading = true;
      this.error = null;
      const {
        teacher,
        startDate,
        endDate,
        dueDateLimit,
        holidays
      } = this.$data;
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
      const { id } = e;
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
        const tests = [];
        const assignments = [];
        res.data.assignments.forEach(assignment => {
          assignment.old_unlock_at = assignment.unlock_at;
          assignment.unlock_at = startDate;
          assignment.old_due_at = assignment.due_at;
          assignment.old_lock_at = assignment.lock_at;
          assignments.push(assignment);
        });
        const { students } = studentRes.data;
        const totalAssignments = assignments.length;
        const flooredInterval = Math.floor(
          (availableDates.length - 1) / totalAssignments
        );
        const ceiledInterval = Math.ceil(
          (availableDates.length - 1) / totalAssignments
        );
        const rawInterval = (availableDates.length - 1) / totalAssignments;
        const flooredDeviation = ceiledInterval - rawInterval;
        const ceiledDeviation = rawInterval - flooredInterval;
        let numFlooredAss = Math.floor(totalAssignments * flooredDeviation);
        let numCeiledAss = Math.ceil(totalAssignments * ceiledDeviation);
        let currentDate = new Date(startDate);
        let dateIndex = 0;
        let repeatDate = false;
        for (let i = 0; i < totalAssignments; i++) {
          const assignPermanentZero = (int, date) => {
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
              const permZeroIndex = holidays.findIndex(x => x === earlyFormat);
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
          };
          const assignDates = int => {
            dateIndex = dateIndex + int;
            const arr = availableDates[dateIndex].split("T");
            const formattedDate = `${arr[0]}T23:59:00.000+04:00`;
            assignments[i].due_at = formattedDate;
            assignPermanentZero(30, formattedDate);
          };
          if (numCeiledAss > 0) {
            assignDates(ceiledInterval);
            numCeiledAss -= 1;
          } else {
            assignDates(flooredInterval);
            numFlooredAss -= 1;
          }
        }
        this.assignments = assignments;
        this.tests = tests;
        this.students = students;
        this.loading = false;
        this.course = id;
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
        teacher,
        course,
        setExtension,
        assignments,
        selectedStudents,
        extension: extensionDate
      } = this.$data;
      const user = localStorage.getItem("icadDateId");
      const teacherIndex = this.$data.teachers.findIndex(
        x => x.apiKey === teacher
      );
      try {
        if (!setExtension) {
          await assignments.forEach(async assignment => {
            if (!putError) {
              const index = assignment.due_at.indexOf("T00:00");
              const index2 = assignment.lock_at.indexOf("T00:00");
              if (index !== -1) {
                const arr = assignment.due_at.split("T");
                assignment.due_at = `${arr[0]}T23:59:00.000+04:00`;
              }
              if (index2 !== -1) {
                const arr = assignment.lock_at.split("T");
                assignment.lock_at = `${arr[0]}T23:59:00.000+04:00`;
              }
              await axios
                .put("/api/assignments", {
                  data: {
                    apiKey,
                    course,
                    override: setExtension,
                    assignment,
                    user,
                    teacher: this.$data.teachers[teacherIndex]._id
                  }
                })
                .then(res => {
                  console.log(res.data.data);
                });
            }
          });
          if (!putError) {
            this.loading = false;
            this.success = true;
          }
        } else {
          const arr = extensionDate.split("T");
          extension = `${arr[0]}T11:59:00+04:00`;
          await assignments.forEach(async assignment => {
            if (!putError) {
              await axios
                .put("/api/assignments", {
                  data: {
                    apiKey,
                    course,
                    override: setExtension,
                    assignment,
                    students: selectedStudents,
                    extension,
                    user,
                    teacher: this.$data.teachers[teacherIndex]._id
                  }
                })
                .then(res => {
                  console.log(res.data.data);
                });
            }
          });
          if (!putError) {
            this.loading = false;
            this.success = true;
          }
        }
      } catch (e) {
        this.loading = false;
        this.error = e.message;
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
.grid-container .grid {
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
</style>
