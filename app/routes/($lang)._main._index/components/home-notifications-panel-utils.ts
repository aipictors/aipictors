/**
 * ベルのお知らせパネルの並びの計算（表示から切り離してテストする）
 */

export type NotificationPanelKind =
  | "liked"
  | "comment"
  | "reply"
  | "follow"
  | "award"
  | "coin"

export type UnreadCounts = {
  liked: number
  comment: number
  reply: number
  follow: number
  award: number
  message: number
  moderation: number
}

export const EMPTY_UNREAD_COUNTS: UnreadCounts = {
  liked: 0,
  comment: 0,
  reply: 0,
  follow: 0,
  award: 0,
  message: 0,
  moderation: 0,
}

/** ベルの数字（コインの付与・失効は含まない） */
export const toUnreadTotal = (counts: UnreadCounts) =>
  counts.liked +
  counts.comment +
  counts.reply +
  counts.follow +
  counts.award +
  counts.message +
  counts.moderation

export const toBadgeText = (count: number) =>
  count > 99 ? "99+" : String(count)

type RowInput = {
  id: string
  kind: NotificationPanelKind
  createdAt: number
  workId?: string | null
}

export type NotificationRow<T extends RowInput> = {
  id: string
  item: T
  /** 同じ作品へのいいねをまとめたもの（新しい順。先頭は item と同じ） */
  group: T[]
  isUnread: boolean
}

const jstDayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
})

const toJstDay = (unixSeconds: number) =>
  jstDayFormat.format(new Date(unixSeconds * 1000))

/**
 * 通知を行にする。新しい順に並んだ一覧の先頭から、種類ごとの未読数の分だけ未読にする。
 * 同じ日の同じ作品へのいいねは 1 行にまとめる
 */
export function toNotificationRows<T extends RowInput>(
  items: readonly T[],
  unread: UnreadCounts,
): NotificationRow<T>[] {
  const remaining = { ...unread }
  const rows: NotificationRow<T>[] = []
  const likedRows = new Map<string, NotificationRow<T>>()

  for (const item of items) {
    const isUnread = item.kind !== "coin" && remaining[item.kind] > 0
    if (isUnread && item.kind !== "coin") {
      remaining[item.kind] -= 1
    }

    if (item.kind === "liked" && item.workId) {
      const key = `${item.workId}:${toJstDay(item.createdAt)}`
      const row = likedRows.get(key)
      if (row) {
        row.group.push(item)
        row.isUnread = row.isUnread || isUnread
        continue
      }
      const newRow = { id: item.id, item, group: [item], isUnread }
      likedRows.set(key, newRow)
      rows.push(newRow)
      continue
    }

    rows.push({ id: item.id, item, group: [item], isUnread })
  }

  return rows
}

export type NotificationSection = "today" | "yesterday" | "week" | "older"

/** 今日・昨日・この 1 週間・それ以前（日付は JST） */
export function toNotificationSection(
  createdAt: number,
  nowSeconds: number,
): NotificationSection {
  const day = Date.parse(toJstDay(createdAt))
  const today = Date.parse(toJstDay(nowSeconds))
  const days = Math.round((today - day) / (24 * 60 * 60 * 1000))
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return "week"
  return "older"
}
