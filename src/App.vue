<template>
	<div id="app" :class="darkMode ? 'dark' : 'light'">
		<router-view :darkMode="darkMode" :setTheme="setTheme" />
	</div>
</template>

<style>
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	transition: 0.4s ease-in-out;
}

body {
	background: #ddf5ff;
	transition: 0.4s ease-in-out;
}

body.dark #app {
	color: #ccc;
}

body.dark {
	background: #222;
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

.navigation {
	position: fixed;
	top: 20px;
	right: 20px;
}

.navigation a {
	text-decoration: none;
	color: #49739c;
	font-weight: bold;
}
</style>

<script>
export default {
	data() {
		return {
			darkMode: false
		};
	},
	beforeMount() {
		const darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
		this.darkMode = darkMode;
		if (darkMode) {
			document.body.classList.add("dark");
		}
	},
	methods: {
		setTheme: function() {
			const { darkMode } = this.$data;
			this.darkMode = !darkMode;
			localStorage.setItem("darkMode", !darkMode);
			if (!darkMode) {
				document.body.classList.add("dark");
			} else {
				document.body.classList.remove("dark");
			}
		}
	}
};
</script>
