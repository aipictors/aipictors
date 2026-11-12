import { expect, test } from "bun:test"
import {
  ACHIEVEMENT_LEVEL_TIERS,
  toAchievementLevelTier,
} from "~/lib/achievements/achievement-level-tier"

test("レベルの幅ごとに段階が決まる", () => {
  expect(toAchievementLevelTier(1).tier.key).toBe("sprout")
  expect(toAchievementLevelTier(4).tier.key).toBe("sprout")
  expect(toAchievementLevelTier(5).tier.key).toBe("bronze")
  expect(toAchievementLevelTier(19).tier.key).toBe("gold")
  expect(toAchievementLevelTier(20).tier.key).toBe("sapphire")
  expect(toAchievementLevelTier(79).tier.key).toBe("crown")
  expect(toAchievementLevelTier(120).tier.key).toBe("legend")
})

test("次の段階を返し、いちばん上では null", () => {
  expect(toAchievementLevelTier(7).next?.minLevel).toBe(10)
  expect(toAchievementLevelTier(80).next).toBeNull()
})

test("段階は始まりのレベルの順に並ぶ", () => {
  const levels = ACHIEVEMENT_LEVEL_TIERS.map((tier) => tier.minLevel)
  expect(levels).toEqual([...levels].sort((a, b) => a - b))
  expect(levels[0]).toBe(1)
})
