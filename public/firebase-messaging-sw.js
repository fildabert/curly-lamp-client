/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');


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
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Registration successful, scope is:', registration.scope);
      }).catch((err) => {
        console.log('Service worker registration failed, error:', err);
      });
  }
}
