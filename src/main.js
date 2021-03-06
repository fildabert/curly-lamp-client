import Vue from 'vue';
import firebase from 'firebase';
import axios from 'axios';
import GAuth from 'vue-google-oauth2';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import { checkLogin } from './helpers/authorization';


const gauthOption = {
  clientId: '202223336560-46k4lh950qbhudoi797tfhnqmdmkgpjl.apps.googleusercontent.com',
  scope: 'profile email',
  prompt: 'select_account',
};
Vue.use(GAuth, gauthOption);

Vue.config.productionTip = false;

// Initialize Firebase
const config = {
  apiKey: 'AIzaSyCJZteEG3ArPupD10y2zbochp0C5yeKIos',
  authDomain: 'curly-lamp.firebaseapp.com',
  databaseURL: 'https://curly-lamp.firebaseio.com',
  projectId: 'curly-lamp',
  storageBucket: 'curly-lamp.appspot.com',
  messagingSenderId: '1049563974014',
  appId: '1:1049563974014:web:2818ecae723467dd554b2f',
};
firebase.initializeApp(config);

if (firebase.messaging.isSupported()) {
  const messaging = firebase.messaging();
  messaging.requestPermission().then(() =>
    // getToken(messaging);
    messaging.getToken()).then(async (token) => {
    const userToken = localStorage.getItem('token');
    const userInfo = checkLogin(userToken);
    try {
      await axios({
        method: 'GET',
        url: `https://curly-lamp.herokuapp.com/users/notificationtoken?notificationToken=${token}&userInfo=${userInfo._id || ''}`,
      });
    } catch (error) {
      // console.log(error)
    }
  })
    .catch((err) => {
      console.log('Permission denied', err);
    });
}


new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
