import { afterEach, describe, expect, setSystemTime, test } from "bun:test"
import { getReservationDetails } from "~/utils/get-reservation-details"

describe("予約投稿の日付と時間", () => {
  afterEach(() => {
    setSystemTime()
  })

  test("未来の投稿は日本時間の日付と時間を返す", () => {
    setSystemTime(new Date("2026-01-01T00:00:00Z"))
    // 2026-01-02 00:30 UTC = 日本時間 09:30
    const createdAt = Date.UTC(2026, 0, 2, 0, 30) / 1000
    expect(getReservationDetails(createdAt)).toEqual({
      reservationDate: "2026-01-02",
      reservationTime: "09:30",
    })
  })

  test("過去の投稿と 0 は予約なし", () => {
    setSystemTime(new Date("2026-01-01T00:00:00Z"))
    const none = { reservationDate: null, reservationTime: null }
    expect(getReservationDetails(Date.UTC(2025, 0, 1) / 1000)).toEqual(none)
    expect(getReservationDetails(0)).toEqual(none)
  })
})
