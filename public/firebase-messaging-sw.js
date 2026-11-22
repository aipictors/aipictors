self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const message = event.notification.data?.FCM_MSG
    ? event.notification.data.FCM_MSG
    : event.notification
  const link = message.data?.link ?? message.data?.url
  if (typeof link !== "string") return
  const url = new URL(link, self.location.origin).href
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // 同じページを開いていればそのタブに切り替える
        const opened = windowClients.find((client) => client.url === url)
        if (opened) return opened.focus()
        return clients.openWindow(url)
      }),
  )
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

/** 開いているタブに、ベルの未読の数を取り直してもらう */
const notifyOpenTabs = () =>
  clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((windowClients) => {
      for (const client of windowClients) {
        client.postMessage({ type: "aipictors:push-received" })
      }
    })

messaging.onBackgroundMessage((payload) => {
  const tabs = notifyOpenTabs()
  // notification つきのもの（リクエストのお知らせ）は Firebase が自動で出すので、ここでは出さない
  if (payload.notification) return tabs
  const data = payload.data ?? {}
  if (typeof data.title !== "string" || data.title === "") return tabs
  return Promise.all([
    tabs,
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      image: data.imageUrl,
      data: { ...data, link: data.link ?? data.url },
      tag: data.tag,
    }),
  ])
})
