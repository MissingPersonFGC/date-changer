<template>
  <div class="login">
    <h1>Login</h1>
    <p>You must login to use this app.</p>
    <p class="error" v-if="error"><span>Error:</span> {{error}}</p>
    <form @submit.prevent="login">
      <label>Email address:</label>
      <input type="email" placeholder="Email address" v-model="email">
      <label>Password:</label>
      <input type="password" placeholder="Password" v-model="password">
    </form>
  </div>
</template>

<script>
  import axios from 'axios';
  export default {
    name: 'auth',
    data() {
      return {
        email: '',
        password: '',
        loading: false,
        error: null,
        success: false
      }
    },
    methods: {
      login: async function() {
        this.loading = true;
        this.error = null;
        const { email, password } = this.$data;
        try {
          const res = await axios.post("/api/users/login", {
            data: {
              email,
              password
            }
          });
          const { token, id } = res.data.data;
          console.log(token, id);
          this.loading = false;
          this.success = true;
        } catch (e) {
          this.loading = false;
          this.error = e.message;
        }
      }
    }
  }
</script>
