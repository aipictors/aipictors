import { describe, expect, test } from "bun:test"
import { ANNIVERSARY_4TH_STATS as stats } from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-stats"

describe("4 周年の特設ページの数字", () => {
  test("月ごとの推移は 2022-11 から順に並ぶ", () => {
    expect(stats.monthly[0]?.month).toBe("2022-11")
    const months = stats.monthly.map((item) => item.month)
    expect([...months].sort()).toEqual(months)
  })

  test("ヒートマップは 7 曜日 × 24 時間", () => {
    expect(stats.postHeatmap).toHaveLength(7)
    for (const row of stats.postHeatmap) expect(row).toHaveLength(24)
  })

  test("割合は 0〜1 で、まとめると 1 になる", () => {
    const groups = [
      stats.ratings,
      stats.workTypes,
      stats.countries,
      ...stats.generationModels.map((group) => group.items),
      ...stats.postedModels.map((group) => group.items),
    ]
    for (const items of groups) {
      for (const item of items) {
        expect(item.share).toBeGreaterThanOrEqual(0)
        expect(item.share).toBeLessThanOrEqual(1)
      }
      const sum = items.reduce((total, item) => total + item.share, 0)
      expect(Math.abs(sum - 1)).toBeLessThan(0.02)
    }
  })

  test("全年齢のページなので、成人向けのタグは載せない", () => {
    const names = stats.tags.flatMap((group) =>
      group.items.map((item) => item.name),
    )
    for (const name of ["巨乳", "おっぱい", "ロリ", "パンチラ"]) {
      expect(names).not.toContain(name)
    }
  })
})
