declare let self: ServiceWorkerGlobalScope
import { firebaseConfig } from "./config"
import firebaseMessaging from "./firebaseMessaging"

// @ts-ignore
self.importScripts("https://www.gstatic.com/firebasejs/7.9.0/firebase-app.js")
// @ts-ignore
self.importScripts(
  "https://www.gstatic.com/firebasejs/7.9.0/firebase-messaging.js",
)

// @ts-ignore
const firebaseApp = firebase.initializeApp(firebaseConfig)
firebaseMessaging(firebaseApp)
