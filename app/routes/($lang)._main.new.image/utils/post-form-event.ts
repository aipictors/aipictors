import {
  jstDateTimeToWallClockUnixSeconds,
  toJstWallClockUnixSeconds,
} from "~/utils/jst-date"

export type EventRating = "G" | "R15" | "R18" | "R18G"

export type EventOption = {
  title: string | null
  description: string | null
  thumbnailImageUrl?: string | null
  headerImageUrl?: string | null
  tag: string | null
  ratings?: EventRating[] | null
  startAt: number
  endAt: number
  slug: string | null
  source: "OFFICIAL" | "USER"
}

export type RawEventOption = Omit<EventOption, "source">

/**
 * 運営のイベントとユーザーのイベントをまとめる。URL で選ばれたイベントが一覧になければ先頭に足す
 */
export const mergePostFormEvents = (props: {
  appEvents: RawEventOption[]
  userEvents: RawEventOption[]
  selectedUserEvent: RawEventOption | undefined
}): EventOption[] => {
  const { appEvents, userEvents, selectedUserEvent } = props

  const mergedUserEvents =
    selectedUserEvent &&
    !userEvents.some(
      (event) =>
        event.slug === selectedUserEvent.slug ||
        event.tag === selectedUserEvent.tag,
    )
      ? [selectedUserEvent, ...userEvents]
      : userEvents

  return [
    ...appEvents.map((event) => ({ ...event, source: "OFFICIAL" as const })),
    ...mergedUserEvents.map((event) => ({ ...event, source: "USER" as const })),
  ]
}

/**
 * タグで選んだイベントが公開の日時に開催しているか調べる。開催していなければ伝える文を返す
 */
export const getPostEventPeriodError = (props: {
  tags: { text: string }[]
  events: EventOption[]
  reservationDate: string | null
  reservationTime: string | null
  t: (jaText: string, enText?: string) => string
}): string | null => {
  const { events, reservationDate, reservationTime, t } = props

  const selectedEventTags = new Set(
    props.tags.map((tag) => tag.text.trim()).filter(Boolean),
  )

  if (selectedEventTags.size === 0) {
    return null
  }

  // イベントの開催期間は日本時間の壁時計をUTCとして扱ったUNIX秒で返却されるため合わせる
  const publishAtUnixSeconds =
    (reservationDate !== null && reservationTime !== null
      ? jstDateTimeToWallClockUnixSeconds(reservationDate, reservationTime)
      : null) ?? toJstWallClockUnixSeconds()

  const selectedEvents = events.filter(
    (event) => event.tag && selectedEventTags.has(event.tag),
  )

  const outOfPeriodEvent = selectedEvents.find((event) => {
    return (
      publishAtUnixSeconds < event.startAt ||
      publishAtUnixSeconds > event.endAt
    )
  })

  if (!outOfPeriodEvent) {
    return null
  }

  if (reservationDate !== null && reservationTime !== null) {
    return t(
      "予約公開日時がイベント開催期間外です。\n開催期間内の日付を指定してください。",
      "Scheduled publish time is outside the event period. Please choose a date within the event period.",
    )
  }

  if (publishAtUnixSeconds < outOfPeriodEvent.startAt) {
    return t(
      "このイベントはまだ開始されていません。\nイベント開始後に投稿してください。",
      "This event has not started yet. Please post after the event starts.",
    )
  }

  return t("このイベントは終了しています。", "This event has ended.")
}

/**
 * 予約投稿の日時をサーバーに送る値にする。日時がそろっていなければ undefined
 */
export const toPostReservedAt = (
  reservationDate: string | null,
  reservationTime: string | null,
) => {
  return reservationDate !== null && reservationTime !== null
    ? new Date(`${reservationDate}T${reservationTime}`).getTime() + 3600000 * 9
    : undefined
}
