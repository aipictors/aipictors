import { describe, expect, test } from "bun:test"
import {
  isInfoOnlyHistory,
  RETENTION_ENFORCE_FROM,
  toRestorePlan,
  toRetentionPeriodLabel,
  toRetentionState,
} from "./generation-retention"

const DAY = 86400
// 消し始めてから十分たった日
const now = RETENTION_ENFORCE_FROM + 400 * DAY

describe("toRetentionState", () => {
  test("期限まで余裕があるものと保護したものはそのまま", () => {
    expect(
      toRetentionState({
        completedAt: now - 10 * DAY,
        isProtected: false,
        plan: null,
        nowSeconds: now,
      }),
    ).toEqual({ kind: "kept" })
    expect(
      toRetentionState({
        completedAt: now - 1000 * DAY,
        isProtected: true,
        plan: null,
        nowSeconds: now,
      }),
    ).toEqual({ kind: "kept" })
  })

  test("無料は 90 日の 14 日前から残りの日数を出す", () => {
    expect(
      toRetentionState({
        completedAt: now - 80 * DAY,
        isProtected: false,
        plan: null,
        nowSeconds: now,
      }),
    ).toEqual({ kind: "expiring", daysLeft: 10, restorePlan: "LITE" })
  })

  test("期限を過ぎて 30 日はグレー（戻せるプラン付き）、そのあとは生成情報だけ", () => {
    expect(
      toRetentionState({
        completedAt: now - 100 * DAY,
        isProtected: false,
        plan: "FREE",
        nowSeconds: now,
      }),
    ).toEqual({ kind: "expired", daysLeft: 20, restorePlan: "LITE" })
    expect(
      toRetentionState({
        completedAt: now - 200 * DAY,
        isProtected: false,
        plan: "LITE",
        nowSeconds: now,
      }),
    ).toEqual({ kind: "expired", daysLeft: 10, restorePlan: "STANDARD" })
    expect(
      toRetentionState({
        completedAt: now - 121 * DAY,
        isProtected: false,
        plan: null,
        nowSeconds: now,
      }),
    ).toEqual({ kind: "deleted" })
  })

  test("上のプランなら期限内", () => {
    expect(
      toRetentionState({
        completedAt: now - 100 * DAY,
        isProtected: false,
        plan: "STANDARD",
        nowSeconds: now,
      }),
    ).toEqual({ kind: "kept" })
  })

  test("消し始める日より前は、その日を期限にする", () => {
    const before = RETENTION_ENFORCE_FROM - 20 * DAY
    expect(
      toRetentionState({
        completedAt: before - 300 * DAY,
        isProtected: false,
        plan: null,
        nowSeconds: before,
      }),
    ).toEqual({ kind: "kept" })
    const soon = RETENTION_ENFORCE_FROM - 5 * DAY
    expect(
      toRetentionState({
        completedAt: soon - 300 * DAY,
        isProtected: false,
        plan: null,
        nowSeconds: soon,
      }),
    ).toEqual({ kind: "expiring", daysLeft: 5, restorePlan: "STANDARD" })
  })
})

describe("toRestorePlan", () => {
  test("プレミアムでも戻せない古さなら null", () => {
    expect(toRestorePlan(800 * DAY, "FREE")).toBeNull()
    expect(toRestorePlan(100 * DAY, "PREMIUM")).toBeNull()
  })
})

test("toRetentionPeriodLabel", () => {
  expect(toRetentionPeriodLabel("FREE", false)).toBe("3か月")
  expect(toRetentionPeriodLabel("STANDARD", false)).toBe("1年")
  expect(toRetentionPeriodLabel("PREMIUM", true)).toBe("2 years")
})

test("isInfoOnlyHistory: 期限から 30 日過ぎて画像がないものだけ", () => {
  const base = { status: "DONE", imageUrl: "", isProtected: false }
  expect(
    isInfoOnlyHistory({ ...base, completedAt: now - 200 * DAY }, null, now),
  ).toBe(true)
  expect(
    isInfoOnlyHistory({ ...base, completedAt: now - 10 * DAY }, null, now),
  ).toBe(false)
  expect(
    isInfoOnlyHistory(
      { ...base, imageUrl: "https://x", completedAt: now - 200 * DAY },
      null,
      now,
    ),
  ).toBe(false)
})
