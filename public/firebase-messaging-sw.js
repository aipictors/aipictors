import { initializeApp } from "firebase/app"
import { getMessaging } from "firebase/messaging/sw"

const firebaseConfig = {
  apiKey: "AIzaSyC_WDct2KrvMkMjgL2hT9CHgflrCdqt8tA",
  authDomain: "kwkjsui8ghyt93ai5feb.firebaseapp.com",
  projectId: "kwkjsui8ghyt93ai5feb",
  storageBucket: "kwkjsui8ghyt93ai5feb.appspot.com",
  messagingSenderId: "698114764060",
  appId: "1:698114764060:web:2aae9f80fee27394b49ed9",
  measurementId: "G-CEP0HMY1WH",
}

initializeApp(firebaseConfig)

const messaging = getMessaging(firebaseApp)
