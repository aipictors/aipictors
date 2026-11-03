import { describe, expect, test } from "bun:test"
import {
  EMPTY_UNREAD_COUNTS,
  toBadgeText,
  toNotificationRows,
  toNotificationSection,
  toUnreadTotal,
} from "./home-notifications-panel-utils"

// 2026-11-03 12:00 JST
const NOW = 1793674800

const liked = (id: string, workId: string, createdAt = NOW) => ({
  id,
  kind: "liked" as const,
  workId,
  createdAt,
})

describe("toNotificationRows", () => {
  test("同じ日の同じ作品へのいいねを 1 行にまとめる", () => {
    const rows = toNotificationRows(
      [liked("3", "a"), liked("2", "b"), liked("1", "a", NOW - 60)],
      EMPTY_UNREAD_COUNTS,
    )
    expect(rows.map((row) => row.id)).toEqual(["3", "2"])
    expect(rows[0]?.group.map((item) => item.id)).toEqual(["3", "1"])
  })

  test("別の日のいいねはまとめない", () => {
    const rows = toNotificationRows(
      [liked("2", "a"), liked("1", "a", NOW - 86400)],
      EMPTY_UNREAD_COUNTS,
    )
    expect(rows).toHaveLength(2)
  })

  test("種類ごとの未読数の分だけ、新しいものから未読にする", () => {
    const rows = toNotificationRows(
      [
        { id: "4", kind: "reply" as const, createdAt: NOW },
        { id: "3", kind: "comment" as const, createdAt: NOW },
        { id: "2", kind: "reply" as const, createdAt: NOW },
        { id: "1", kind: "comment" as const, createdAt: NOW },
      ],
      { ...EMPTY_UNREAD_COUNTS, reply: 1, comment: 2 },
    )
    expect(rows.map((row) => row.isUnread)).toEqual([true, true, false, true])
  })

  test("まとめたいいねに未読が 1 つでもあれば未読にする", () => {
    const rows = toNotificationRows(
      [liked("2", "a"), liked("1", "a", NOW - 60)],
      { ...EMPTY_UNREAD_COUNTS, liked: 1 },
    )
    expect(rows[0]?.isUnread).toBe(true)
  })

  test("コインのお知らせは未読にしない", () => {
    const rows = toNotificationRows(
      [{ id: "1", kind: "coin" as const, createdAt: NOW }],
      { ...EMPTY_UNREAD_COUNTS, liked: 5 },
    )
    expect(rows[0]?.isUnread).toBe(false)
  })
})

describe("toNotificationSection", () => {
  test("JST の日付で分ける", () => {
    expect(toNotificationSection(NOW, NOW)).toBe("today")
    expect(toNotificationSection(NOW - 86400, NOW)).toBe("yesterday")
    expect(toNotificationSection(NOW - 3 * 86400, NOW)).toBe("week")
    expect(toNotificationSection(NOW - 8 * 86400, NOW)).toBe("older")
  })
})

test("ベルの数字", () => {
  expect(
    toUnreadTotal({ ...EMPTY_UNREAD_COUNTS, liked: 2, moderation: 1 }),
  ).toBe(3)
  expect(toBadgeText(100)).toBe("99+")
  expect(toBadgeText(3)).toBe("3")
})
