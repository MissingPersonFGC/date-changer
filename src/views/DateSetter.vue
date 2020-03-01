<template>
  <div class="home">
    <h1>Assignment Date Editor</h1>
    <div class="selection">
      <!-- <label>Upload permanent zero/holiday calendar:</label>
      <input type="file"> -->
      <p
        v-if="error"
        class="error"
      >
        <span>Error:</span> {{error}}
      </p>
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
          disabled
        >
        <label for="setExtension">Set new end dates for students with an extension</label>
        <div
          v-if="setExtension"
          class="select-student"
        >
          <div class="set-extension">
            <p>Extension end date:</p>
            <datetime type="date" />
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
                v-model="selectedStudents
              "
              >
              {{student.sortable_name}}
            </div>
          </div>
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
          <div
            class="permanent-zero"
            v-if="!setExtension"
          >End Date:</div>
          <div
            class="extension"
            v-if="setExtension"
          >New End Date:</div>
        </div>
        <div
          class="grid"
          v-for="assignment in assignments"
          :key="assignment.id"
        >
          <div class="name">{{assignment.name}}</div>
          <div class="unlock">
            <datetime type="date" />
          </div>
          <div class="due">
            <datetime type="date" />
          </div>
          <div
            class="permanent-zero"
            v-if="!setExtension"
          >
            <datetime type="date" />
          </div>
          <div
            class="extension"
            v-if="setExtension"
          >
            <datetime type="date" />
          </div>
        </div>
      </div>
      <button class="submit">
        Submit Dates
      </button>
    </div>
  </div>
</template>

<script>
import "vue-datetime/dist/vue-datetime.css";
import "vue-select/dist/vue-select.css";
import axios from "axios";
// @ is an alias to /src

export default {
  name: "date-setter",
  data() {
    return {
      teachers: [],
      teacher: "",
      courses: [],
      course: "",
      assignments: [],
      setExtension: true,
      students: [],
      loading: false,
      error: null,
      success: false,
      selectedStudents: []
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
      const { teacher } = this.$data;
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
        this.error = e.message;
      }
      this.course = id;
    }
  }
};
</script>

<style>
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
</style>
