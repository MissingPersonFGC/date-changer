<template>
	<div class="add-teacher">
		<div class="toggle">
			<label class="switch">
				<input type="checkbox" :checked="darkMode" @change="setTheme" />
				<span class="slider round" />
			</label>
		</div>
		<h1>Add a Teacher</h1>
		<form @submit.prevent="addTeacher">
			<p>First Name:</p>
			<input type="text" v-model="firstName" />
			<p>Last Name</p>
			<input type="text" v-model="lastName" />
			<p>Designation:</p>
			<input type="text" v-model="designation" />
			<p>API Key:</p>
			<input type="text" v-model="apiKey" />
			<button type="submit">Add Teacher</button>
		</form>
	</div>
</template>

<script>
import axios from "axios";
export default {
	name: "add-teacher",
	props: {
		darkMode: Boolean
	},
	data() {
		return {
			firstName: "",
			lastName: "",
			designation: "",
			apiKey: "",
			success: false
		};
	},
	addTeacher: async function() {
		const teacher = this.$data;
		const res = await axios.post("/api/teachers", {
			teacher
		});
		this.data.success = true;
		this.data.firstName = "";
		this.data.lastName = "";
		this.data.designation = "";
		this.data.apiKey = "";
	}
};
</script>
