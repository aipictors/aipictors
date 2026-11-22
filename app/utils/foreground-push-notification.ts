/**
 * プッシュが届いたときに window へ流すイベント（開いている画面: context-providers の onMessage、
 * ほかのタブ・裏のタブ: サービスワーカーからの postMessage を home-header が受けて流す）
 */
export const PUSH_RECEIVED_EVENT = "aipictors:push-received"

/**
 * 画面を開いている間に届いたプッシュを、サービスワーカーで出せる形にする。
 *
 * FCM の送信側は通知の文面を `notification`（リクエストのお知らせ: aipictors-api
 * src/lib/coin-requests/notify.ts）か `data`（サイトの通知: aipictors-system lib/web-push.ts）のどちらかで送る。
 * `data` だけを見ていると、`notification` で送られたものがタイトルなしで出てしまう。
 * 押したときに開く URL は、サービスワーカーの notificationclick が `data.link` を見るので
 * `data.url` や fcmOptions の link からそろえておく。
 */
type Payload = {
  notification?: {
    title?: string
    body?: string
    image?: string
    icon?: string
  }
  data?: Record<string, string>
  fcmOptions?: { link?: string }
}

export type ForegroundNotification = {
  title: string
  options: {
    body?: string
    icon?: string
    image?: string
    tag?: string
    data: Record<string, string>
  }
}

export function toForegroundNotification(
  payload: Payload | undefined | null,
): ForegroundNotification | null {
  const data = payload?.data ?? {}
  const notification = payload?.notification
  const title = notification?.title ?? data.title
  if (typeof title !== "string" || title.trim() === "") {
    return null
  }
  const link = data.link ?? data.url ?? payload?.fcmOptions?.link
  return {
    title,
    options: {
      body: notification?.body ?? data.body,
      icon: notification?.icon ?? data.icon,
      image: notification?.image ?? data.imageUrl,
      tag: data.tag,
      data: link === undefined ? data : { ...data, link },
    },
  }
}
