import { describe, expect, test } from "bun:test"
import {
  type EventOption,
  getPostEventPeriodError,
  mergePostFormEvents,
  type RawEventOption,
  toPostReservedAt,
} from "~/routes/($lang)._main.new.image/utils/post-form-event"
import { jstDateTimeToWallClockUnixSeconds } from "~/utils/jst-date"

const t = (ja: string) => ja

const rawEvent = (slug: string, tag: string): RawEventOption => ({
  title: slug,
  description: null,
  tag,
  startAt: 0,
  endAt: 0,
  slug,
})

describe("mergePostFormEvents", () => {
  const app = rawEvent("app", "運営")
  const user = rawEvent("user", "ユーザー")

  test("運営のイベントを先にして種類を付ける", () => {
    const events = mergePostFormEvents({
      appEvents: [app],
      userEvents: [user],
      selectedUserEvent: undefined,
    })
    expect(events.map((event) => [event.slug, event.source])).toEqual([
      ["app", "OFFICIAL"],
      ["user", "USER"],
    ])
  })

  test("URL で選んだイベントが一覧になければユーザーのイベントの先頭に足す", () => {
    const selected = rawEvent("selected", "選択")
    const events = mergePostFormEvents({
      appEvents: [app],
      userEvents: [user],
      selectedUserEvent: selected,
    })
    expect(events.map((event) => event.slug)).toEqual(["app", "selected", "user"])
  })

  test("slug かタグが同じなら足さない", () => {
    expect(
      mergePostFormEvents({
        appEvents: [],
        userEvents: [user],
        selectedUserEvent: rawEvent("other", "ユーザー"),
      }).map((event) => event.slug),
    ).toEqual(["user"])
  })
})

describe("getPostEventPeriodError", () => {
  const reservation = (date: string, time: string) =>
    jstDateTimeToWallClockUnixSeconds(date, time) ?? 0

  const event: EventOption = {
    ...rawEvent("event", "イベント"),
    startAt: reservation("2026-01-10", "00:00"),
    endAt: reservation("2026-01-20", "00:00"),
    source: "OFFICIAL",
  }

  const check = (
    tags: string[],
    reservationDate: string | null,
    reservationTime: string | null,
    events: EventOption[] = [event],
  ) =>
    getPostEventPeriodError({
      tags: tags.map((text) => ({ text })),
      events,
      reservationDate,
      reservationTime,
      t,
    })

  test("タグがなければ調べない", () => {
    expect(check([], "2030-01-01", "00:00")).toBeNull()
    expect(check(["  "], "2030-01-01", "00:00")).toBeNull()
  })

  test("イベントのタグでなければ調べない", () => {
    expect(check(["別"], "2030-01-01", "00:00")).toBeNull()
  })

  test("予約が期間の中なら問題ない", () => {
    expect(check(["イベント"], "2026-01-15", "12:00")).toBeNull()
  })

  test("予約が期間の外なら予約の日時を直してもらう", () => {
    expect(check(["イベント"], "2026-02-01", "12:00")).toContain(
      "予約公開日時がイベント開催期間外です",
    )
  })

  test("予約なしは今の日時で、始まる前と終わった後を分ける", () => {
    expect(
      check(["イベント"], null, null, [
        { ...event, startAt: 32503680000, endAt: 32503680001 },
      ]),
    ).toContain("このイベントはまだ開始されていません")
    expect(check(["イベント"], null, null)).toBe(
      "このイベントは終了しています。",
    )
  })
})

describe("toPostReservedAt", () => {
  test("日時がそろっていなければ undefined", () => {
    expect(toPostReservedAt(null, null)).toBeUndefined()
    expect(toPostReservedAt("2026-01-01", null)).toBeUndefined()
    expect(toPostReservedAt(null, "10:00")).toBeUndefined()
  })

  test("端末の時刻として読んで 9 時間足す", () => {
    expect(toPostReservedAt("2026-01-01", "10:00")).toBe(
      new Date("2026-01-01T10:00").getTime() + 9 * 3600000,
    )
  })
})
