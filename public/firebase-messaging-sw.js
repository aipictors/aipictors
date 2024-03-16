importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyC_WDct2KrvMkMjgL2hT9CHgflrCdqt8tA",
  authDomain: "kwkjsui8ghyt93ai5feb.firebaseapp.com",
  projectId: "kwkjsui8ghyt93ai5feb",
  storageBucket: "kwkjsui8ghyt93ai5feb.appspot.com",
  messagingSenderId: "698114764060",
  appId: "1:698114764060:web:2aae9f80fee27394b49ed9",
  measurementId: "G-CEP0HMY1WH"
}

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icon.png',
  }
  self.registration.showNotification(notificationTitle, notificationOptions);
})
