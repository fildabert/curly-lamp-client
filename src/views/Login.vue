<template>
<v-container>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
  <v-row>
    <v-col offset="3">
      <v-img width="500" height="300" src="https://lh5.googleusercontent.com/proxy/I2oK4vnLiwK7VH1GniKKpxtB8nsqrR5aenTlnUpooctP8vRu1QMh4cFhvP4zQMuLKA8wj8juQumfex57Ch9KpnFPPH78LCb3r9fS_sLBzMFyZosWSF_tMHMjEWopMeyKozld"></v-img>
    </v-col>
  </v-row>

    <h3>Login</h3>
    <v-text-field
      v-model="username"
      :rules="[v => !!v || 'Username is required']"
      label="Username"
      required
    ></v-text-field>

    <v-text-field
      v-model="password"
      :rules="[v => !!v || 'Password is required']"
      label="Password"
      type="password"
      required
    ></v-text-field>

    <v-btn
      :disabled="!valid"
      color="success"
      class="mr-4"
      @click="validate"
      :loading="$store.state.loading"
    >
      Login
    </v-btn>
    <v-btn>
      <v-icon>fab fa-google</v-icon>
      <span class="pl-1" @click="googleLogin">Login with google</span>
    </v-btn>
  </v-form>

</v-container>
</template>

<script>
import axios from 'axios';
import { checkLogin } from '../helpers/authorization';

export default {
  data: () => ({
    baseUrl: '',
    valid: true,
    username: '',
    password: '',
  }),

  created() {
    this.baseUrl = this.$store.state.baseUrl;
  },

  methods: {
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
        this.login();
      }
    },
    async login() {
      this.$store.commit('SET_LOADING', true);
      try {
        const { data } = await axios({
          method: 'POST',
          url: `${this.baseUrl}/users/login`,
          data: {
            username: this.username,
            password: this.password,
          },
        });
        localStorage.setItem('token', data);
        const userData = checkLogin(data);
        this.$store.commit('SET_LOGIN', { isLogin: true, user: { ...userData } });
      } catch (error) {
        this.$store.commit('SET_ERROR', error.response.data.message || error.response.data);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },
    async googleLogin() {
      try {
        const GoogleUser = await this.$gAuth.signIn();
        console.log(GoogleUser);
        const idToken = GoogleUser.getAuthResponse().id_token;
        const { data } = await axios({
          method: 'POST',
          url: `${this.baseUrl}/users/googlelogin`,
          data: {
            idToken,
          },
        });
        localStorage.setItem('token', data);
        const userData = checkLogin(data);
        this.$store.commit('SET_LOGIN', { isLogin: true, user: { ...userData } });
      } catch (error) {
        console.log(error);
        this.$store.commit('SET_ERROR', error.response.data.message || error.response.data);
      } finally {
        this.$store.commit('SET_LOADING', false);
      }
    },
  },
};
</script>
