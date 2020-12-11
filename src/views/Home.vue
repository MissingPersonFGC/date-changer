<template>
  <div class="home">
    <div class="toggle">
      <label class="switch">
        <input type="checkbox" :checked="darkMode" @change="setTheme" />
        <span class="slider round" />
      </label>
    </div>
    <Auth v-if="!user" :setUser="setUser" :darkMode="darkMode" />
    <DateSetter v-if="user" :darkMode="darkMode" />
  </div>
</template>

<script>
import "vue-datetime/dist/vue-datetime.css";
import "vue-select/dist/vue-select.css";
import Auth from "./Auth";
import DateSetter from "./DateSetter";
// @ is an alias to /src

export default {
  name: "home",
  components: {
    Auth,
    DateSetter
  },
  props: {
    darkMode: Boolean,
    setTheme: Function
  },
  data() {
    return {
      user: null
    };
  },
  beforeMount() {
    const user = localStorage.getItem("icadDateId");
    this.user = user;
  },
  methods: {
    setUser: function(id) {
      this.user = id;
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

body .style-chooser,
body .style-chooser .vs__clear,
body .style_chooser .vs__open-indicator,
body .style_chooser .vs__selected,
body .style_chooser .vs__search::placeholder {
  transition: 0.4s ease-in-out;
}

body.dark .style-chooser {
  border: 1px solid #fff;
  border-radius: 5px;
}

body.dark .style-chooser .vs__clear,
body.dark .style-chooser .vs__open-indicator {
  fill: #ddd;
}

body.dark .style-chooser .vs__selected {
  color: #aaa;
}

body.dark .style-chooser .vs__search::placeholder {
  color: #ddd;
}

@keyframes rotation {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.loading {
  position: fixed;
  top: 10px;
  right: 15px;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  border-top: 3px solid skyblue;
  border-right: 3px solid black;
  border-bottom: 3px solid darkgray;
  border-left: 3px solid darkblue;
  background: white;
  z-index: 5;
}
.loading[aria-busy="true"] {
  animation: rotation 0.5s linear infinite;
}
button:disabled {
  background: #333;
}
button:disabled:hover {
  background: #333;
}

.toggle {
  position: fixed;
  top: 10px;
  left: 15px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
  width: 60px;
  height: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.toggle input {
  display: none;
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #fff;
}

input:focus + .slider {
  box-shadow: 0 0 1px #fff;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
  background: #222;
}
</style>
