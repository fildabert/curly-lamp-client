import firebase from 'firebase';
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

const messaging = firebase.messaging();
messaging.requestPermission().then(() =>
  // getToken(messaging);
  messaging.getToken()).then((token) => {
  console.log(token);
})
  .catch((err) => {
    console.log('Permission denied', err);
  });


messaging.onMessage((payload) => {
  console.log('onMessage: ', payload);
});
