import { expect, test } from "bun:test"
import { findCreatorRewardEarning } from "~/hooks/use-creator-reward-earnings"
import type { CreatorRewardEarning } from "~/lib/creator-rewards"

const earning = (
  id: number,
  createdAt: number,
  workId: string | null,
  kind: CreatorRewardEarning["kind"] = "SUPPORT",
): CreatorRewardEarning => ({
  id,
  kind,
  workId,
  fromProfile: workId === null,
  coins: 10,
  amountYen: 5,
  status: "HOLDING",
  availableAt: createdAt + 60 * 86400,
  reversedReason: null,
  createdAt,
})

test("時刻が近く作品が同じものを選ぶ", () => {
  const earnings = [
    earning(1, 1000, "w1"),
    earning(2, 1010, "w2"),
    earning(3, 1003, "w1"),
    earning(4, 1001, "w1", "CLAWBACK"),
  ]
  expect(
    findCreatorRewardEarning(earnings, { createdAt: 1002, workId: "w1" })?.id,
  ).toBe(3)
  expect(
    findCreatorRewardEarning(earnings, { createdAt: 1009, workId: "w2" })?.id,
  ).toBe(2)
  expect(findCreatorRewardEarning(earnings, { createdAt: 1009 })?.id).toBe(2)
})

test("離れすぎていれば無し", () => {
  expect(
    findCreatorRewardEarning([earning(1, 1000, "w1")], {
      createdAt: 2000,
      workId: "w1",
    }),
  ).toBeNull()
  expect(
    findCreatorRewardEarning([earning(1, 1000, "w1")], {
      createdAt: 1000,
      workId: "w9",
    }),
  ).toBeNull()
})
