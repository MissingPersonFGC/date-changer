<template>
  <div class="home">
    <Auth
      v-if="!user"
      :setUser="setUser"
    />
    <DateSetter v-if="user" />
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

@keyframes rotation {
  from {
    transform: rotateZ(0deg);
  }
  to {
    transform: rotateZ(360deg);
  }
}

.loading {
  position: static;
  top: 10px;
  right: 0px;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  border-top: 3px solid skyblue;
  border-right: 3px solid black;
  border-bottom: 3px solid darkgray;
  border-left: 3px solid darkblue;
  background: white;
}
.loading[aria-busy="true"] {
  animation: rotation 0.5s linear infinite;
}
</style>
