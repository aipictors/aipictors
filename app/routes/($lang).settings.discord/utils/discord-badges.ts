/**
 * Discord の名前の横に出すバッジ（aipictors-api の lib/discord.ts と同じ決まり）
 */

import { toAchievementBadgeUrl } from "~/lib/achievements/achievement-ui"

const LEVEL_ROLE_TIERS: { level: number; tier: number }[] = [
  { level: 1, tier: 1 },
  { level: 5, tier: 1 },
  { level: 10, tier: 2 },
  { level: 15, tier: 2 },
  { level: 20, tier: 3 },
  { level: 30, tier: 3 },
  { level: 40, tier: 4 },
  { level: 50, tier: 4 },
  { level: 60, tier: 5 },
  { level: 70, tier: 5 },
  { level: 80, tier: 6 },
  { level: 90, tier: 6 },
  { level: 100, tier: 7 },
]

const TIER_COLORS: Record<number, string> = {
  1: "#cd7f32",
  2: "#b4c0cc",
  3: "#f1c40f",
  4: "#8fd3e8",
  5: "#4fc3f7",
  6: "#b14cff",
  7: "#ff4d6d",
}

const toLevelRole = (level: number) => {
  let matched = LEVEL_ROLE_TIERS[0]
  for (const role of LEVEL_ROLE_TIERS) {
    if (level >= role.level) matched = role
  }
  return matched
}

export const toLevelTier = (level: number) => toLevelRole(level).tier

export const toLevelBadgeUrl = (level: number) =>
  `/discord/level/${toLevelRole(level).level}.png`

export const toAchievementRoleBadgeUrl = (key: string) =>
  toAchievementBadgeUrl({ key, isHidden: false, isUnlocked: true })

export const toDiscordTierColor = (tier: number) =>
  TIER_COLORS[tier] ?? "#f2f3f5"
