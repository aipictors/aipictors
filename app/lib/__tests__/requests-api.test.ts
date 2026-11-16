import { describe, expect, test } from "bun:test"
import {
  formatCoins,
  formatRemaining,
  PLAN_CATEGORY_LABELS,
  PLAN_CATEGORY_LABELS_EN,
  planCategoryLabel,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_LABELS_EN,
  RequestsApiError,
  requestErrorMessage,
  requestStatusLabel,
} from "~/lib/requests-api"

const now = () => Math.floor(Date.now() / 1000)

describe("requestErrorMessage", () => {
  test("日本語がデフォルトのまま", () => {
    const error = new RequestsApiError("INSUFFICIENT_COINS", 400)
    expect(requestErrorMessage(error)).toBe("コインが足りません")
    expect(requestErrorMessage(error, false)).toBe("コインが足りません")
  })

  test("英語を返す", () => {
    const error = new RequestsApiError("INSUFFICIENT_COINS", 400)
    expect(requestErrorMessage(error, true)).toBe("Not enough coins")
  })

  test("知らないコードは汎用の文言", () => {
    expect(requestErrorMessage(new Error("x"))).toBe(
      "うまくいきませんでした。時間をおいてお試しください",
    )
    expect(requestErrorMessage(new Error("x"), true)).toBe(
      "Something went wrong. Please try again later",
    )
  })
})

describe("labels", () => {
  test("カテゴリと状態の日本語は変わらない", () => {
    expect(PLAN_CATEGORY_LABELS.ICON).toBe("アイコン")
    expect(REQUEST_STATUS_LABELS.PENDING).toBe("承諾待ち")
  })

  test("英語のラベルが全部そろっている", () => {
    expect(Object.keys(PLAN_CATEGORY_LABELS_EN)).toEqual(
      Object.keys(PLAN_CATEGORY_LABELS),
    )
    expect(Object.keys(REQUEST_STATUS_LABELS_EN)).toEqual(
      Object.keys(REQUEST_STATUS_LABELS),
    )
    expect(planCategoryLabel("ICON", true)).toBe("Icon")
    expect(planCategoryLabel("UNKNOWN", true)).toBe("UNKNOWN")
    expect(requestStatusLabel("ACCEPTED", true)).toBe("In progress")
    expect(requestStatusLabel("ACCEPTED")).toBe("制作中")
  })
})

describe("formatRemaining", () => {
  test("日本語", () => {
    expect(formatRemaining(now() + 86400 * 2 + 60)).toBe("あと 2 日")
    expect(formatRemaining(now() + 3600 * 5 + 60)).toBe("あと 5 時間")
    expect(formatRemaining(now() - 10)).toBe("期限を過ぎています")
    expect(formatRemaining(null)).toBe("")
  })

  test("英語（単数・複数）", () => {
    expect(formatRemaining(now() + 86400 * 2 + 60, true)).toBe("2 days left")
    expect(formatRemaining(now() + 86400 + 60, true)).toBe("1 day left")
    expect(formatRemaining(now() + 3600 + 60, true)).toBe("1 hour left")
    expect(formatRemaining(now() - 10, true)).toBe("Past due")
  })
})

test("formatCoins", () => {
  expect(formatCoins(12345)).toBe("12,345")
  expect(formatCoins(12345, true)).toBe("12,345")
})
