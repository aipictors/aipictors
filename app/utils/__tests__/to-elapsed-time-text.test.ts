import { describe, expect, test } from "bun:test"
import { toElapsedTimeText } from "~/utils/to-elapsed-time-text"

describe("toElapsedTimeText", () => {
  test("1分前", () => {
    const elapsedTimeText = toElapsedTimeText(
      Math.floor(Date.now() / 1000) - 60,
    )
    expect(elapsedTimeText).toBe("1分前")
  })

  test("1時間前", () => {
    const elapsedTimeText = toElapsedTimeText(
      Math.floor(Date.now() / 1000) - 3600,
    )
    expect(elapsedTimeText).toBe("1時間前")
  })

  test("1日前", () => {
    const elapsedTimeText = toElapsedTimeText(
      Math.floor(Date.now() / 1000) - 86400,
    )
    expect(elapsedTimeText).toBe("1日前")
  })
})
