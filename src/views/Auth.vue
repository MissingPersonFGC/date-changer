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
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script>
  import axios from 'axios';
  import { setToken } from '../services/tokenService';
  export default {
    name: 'auth',
    props: {
      setUser: Function
    },
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
          setToken(token);
          localStorage.setItem('icadDateId', id);
          this.$props.setUser(id);
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

<style scoped>
  form {
    text-align: left;
    max-width: 300px;
    width: 100%;
    margin: 0 auto;
  }
  form input {
    width: 100%;
    margin: 5px 0 15px;
    padding: 5px 10px;
    border: 0;
    border-bottom: 1px solid darkblue;
    transition: all 0.3s ease-in-out;
  }
  form input:active {
    border-bottom: 1px solid blue;
  }
  button {
    background: #2c3e50;
    border: 0;
    border-radius: 5px;
    color: #ddf5ff;
    padding: 10px 15px;
    text-transform: uppercase;
    font-weight: bold;
    transition: all 0.5s ease-in-out;
  }
  button {
    background: #253d55;
    border-radius: 7px;
  }
</style>
