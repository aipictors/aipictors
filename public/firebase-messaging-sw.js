self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const message = event.notification.data.FCM_MSG
    ? event.notification.data.FCM_MSG
    : event.notification
  if (typeof message.data.link !== "string") return
  event.waitUntil(clients.openWindow(message.data.link))
})

importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js")
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js")

firebase.initializeApp({
  apiKey: "AIzaSyC_WDct2KrvMkMjgL2hT9CHgflrCdqt8tA",
  authDomain: "kwkjsui8ghyt93ai5feb.firebaseapp.com",
  projectId: "kwkjsui8ghyt93ai5feb",
  storageBucket: "kwkjsui8ghyt93ai5feb.appspot.com",
  messagingSenderId: "698114764060",
  appId: "1:698114764060:web:2aae9f80fee27394b49ed9",
  measurementId: "G-CEP0HMY1WH",
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    icon: payload.data.icon,
    image: payload.data.imageUrl,
    data: payload.data,
    tag: payload.data.tag,
  })
})
