import { test, expect } from "bun:test"
import { getMaxPagesByPlan } from "./get-max-pages-by-plan"

test("無料プランは20ページまで", () => {
  expect(getMaxPagesByPlan(null)).toBe(20)
  expect(getMaxPagesByPlan(undefined)).toBe(20)
})

test("ライトプランは30ページまで", () => {
  expect(getMaxPagesByPlan("LITE" as const)).toBe(30)
})

test("スタンダードプランは50ページまで", () => {
  expect(getMaxPagesByPlan("STANDARD" as const)).toBe(50)
})

test("プレミアムプランは100ページまで", () => {
  expect(getMaxPagesByPlan("PREMIUM" as const)).toBe(100)
})
