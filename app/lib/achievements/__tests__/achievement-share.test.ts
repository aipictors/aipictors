import { expect, test } from "bun:test"
import {
  toAchievementShareCardUrl,
  toAchievementSharePageUrl,
  toAchievementShareText,
  toShareIntentUrls,
} from "~/lib/achievements/achievement-share"

test("カードの URL は達成数と日付（JST）をパスに入れる", () => {
  // 2026-11-01 23:30 JST
  const now = new Date("2026-11-01T14:30:00Z")
  expect(
    toAchievementShareCardUrl({ userId: "1", unlockedCount: 115, now }),
  ).toBe("https://card.aipictors.com/achievements/1/115-20261101.png")
  expect(
    toAchievementShareCardUrl({
      userId: "1",
      unlockedCount: 115,
      highlight: "works-300",
      now,
    }),
  ).toBe("https://card.aipictors.com/achievements/1/115-20261101/works-300.png")
})

test("シェアの文と各サービスの URL", () => {
  const url = toAchievementSharePageUrl({ userId: "1", highlight: "works-300" })
  expect(url).toBe(
    "https://www.aipictors.com/achievements?user=1&highlight=works-300",
  )
  const text = toAchievementShareText({
    level: 24,
    unlockedCount: 115,
    totalCount: 179,
    highlightName: "アトリエの主",
  })
  expect(text).toContain("アトリエの主")
  const intents = toShareIntentUrls({ text, url })
  expect(intents.x).toStartWith("https://x.com/intent/post?text=")
  expect(decodeURIComponent(intents.bluesky)).toContain(url)
})
