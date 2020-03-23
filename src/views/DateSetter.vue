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
      >
        <span>Error:</span> {{error}}
      </p>
      <div class="date-grid">
        <div>
          <p>Set start date of course:</p>
          <datetime
            type="date"
            v-model="startDate"
            zone="Asia/Dubai"
            value-zone="Asia/Dubai"
            input-id="course-start-date"
          />
        </div>
        <div>
          <p>Set end date of course:</p>
          <datetime
            type="date"
            v-model="endDate"
            zone="Asia/Dubai"
            value-zone="Asia/Dubai"
            input-id="course-end-date"
          />
        </div>
      </div>
      <p>Select a teacher:</p>
      <v-select
        label="fullName"
        :options="teachers"
        @input="setTeacher"
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
      <h2>Assignments</h2>
      <div class="set-extension">
        <input
          type="checkbox"
          v-model="setExtension"
          name="setExtension"
        >
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
              >
              {{student.sortable_name}}
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
          <div class="name">{{assignment.name}}</div>
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
      <button
        class="submit"
        @click.prevent="submitDates"
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

export default {
  name: "date-setter",
  data() {
    return {
      teachers: [],
      teacher: "",
      courses: [],
      course: "",
      assignments: [],
      tests: [],
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
      showTests: false
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
      const { teacher, startDate, endDate } = this.$data;
      const calculateDateSpan = (start, end) => {
        const dt1 = new Date(start);
        const dt2 = new Date(end);
        return Math.floor(
          (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
            Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
            (1000 * 60 * 60 * 24)
        );
      };
      const initialDateRange = calculateDateSpan(startDate, endDate);
      console.log(initialDateRange);
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
        const { assignments } = res.data;
        const { students } = studentRes.data;
        this.assignments = assignments;
        this.students = students;
        this.loading = false;
      } catch (e) {
        this.loading = false;
        this.error = e.message;
      }
      this.course = id;
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
        selectedStudents
      } = this.$data;
      let { extension } = this.$data;
      try {
        if (!setExtension) {
          await assignments.forEach(async assignment => {
            if (!putError) {
              await axios
                .put("/api/assignments", {
                  data: {
                    apiKey,
                    course,
                    override: setExtension,
                    assignments
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
          await assignments.forEach(async assignment => {
            extension = `${extension}T11:59:00+04:00`;
            if (!putError) {
              await axios
                .put("/api/assignments", {
                  data: {
                    apiKey,
                    course,
                    override: setExtension,
                    assignments,
                    students: selectedStudents,
                    extension
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
  grid-template-columns: 2fr repeat(3, 1fr);
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
  width: 88%;
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
