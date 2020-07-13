<template>
  <div id="app">
		<router-view :darkMode="darkMode" />
  </div>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  background: #ddf5ff;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

<script>
export default {
	data() {
		return {
			darkMode: false
		}
	},
	beforeMount() {
		const darkMode = localStorage.getItem('darkMode') || false;
		this.darkMode = darkMode;
	}
}
</script>
