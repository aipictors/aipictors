import * as firebase from "firebase/app"
import "firebase/messaging"
import { firebaseConfig } from "./config"

firebase.initializeApp(firebaseConfig)

// @ts-ignore
self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close()

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const message: any = event.notification.data.FCM_MSG
    ? event.notification.data.FCM_MSG
    : event.notification
  if (typeof message.data.link !== "string") return
  // @ts-ignore
  event.waitUntil(clients.openWindow(message.data.link))
})
