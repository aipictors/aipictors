declare let self: ServiceWorkerGlobalScope

interface MessagePayload {
  notification: {
    title: string
    body: string
    icon: string
    imageUrl: string
    data: string
    tag: string
  }
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
type FirebaseMessagingOptions = {}

export default (
  // @ts-ignore
  firebase: firebase.app.App,
  options?: FirebaseMessagingOptions,
) => {
  firebase.messaging().onBackgroundMessage((message: MessagePayload) => {
    const notificationTitle: string = message.notification.title
    const notificationOptions: NotificationOptions = {
      body: message.notification.body,
      icon: message.notification.icon,
      // @ts-ignore
      image: message.notification.imageUrl,
      data: message.notification.data,
      tag: message.notification.tag,
    }
    // @ts-ignore
    return self.registration.showNotification(
      notificationTitle,
      notificationOptions,
    )
  })
}
