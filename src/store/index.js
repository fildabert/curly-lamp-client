/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLogin: false,
    baseUrl: 'https://curly-lamp-server.fildabert.com',
    // baseUrl: 'http://localhost:3000',
    user: {},
    loading: false,
    hello: 'world',
    error: false,
    errorMessage: '',
    asd: true,
  },
  mutations: {
    SET_LOADING: (state, payload) => {
      state.loading = payload;
    },
    SET_ERROR: (state, payload) => {
      state.error = true;
      state.errorMessage = payload;
    },
    SET_LOGIN: (state, payload) => {
      state.isLogin = payload.isLogin;
      state.user = payload.user;
    },
  },
  actions: {
  },
  modules: {
  },
});
