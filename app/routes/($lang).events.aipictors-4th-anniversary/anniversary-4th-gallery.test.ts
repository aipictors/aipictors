import { describe, expect, test } from "bun:test"
import {
  ANNIVERSARY_4TH_MONTHLY_HIGHLIGHTS as monthly,
  ANNIVERSARY_4TH_WALL_WORKS as wall,
  ANNIVERSARY_4TH_YEARLY_MORE_WORKS as yearlyMore,
} from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-gallery"
import { ANNIVERSARY_4TH_STATS as stats } from "~/routes/($lang).events.aipictors-4th-anniversary/anniversary-4th-stats"
import { findMilestones } from "~/routes/($lang).events.aipictors-4th-anniversary/utils/find-milestones"

describe("4 周年の特設ページの作品画像", () => {
  test("タイムラインは 2022-11 から 2026-11 まで毎月 1 作品", () => {
    const months = monthly.map((item) => item.month)
    expect(months[0]).toBe("2022-11")
    expect(months.at(-1)).toBe("2026-11")
    expect(months).toHaveLength(49)
    expect([...months].sort()).toEqual(months)
  })

  test("画像はすべて https で、作品が重ならない", () => {
    const works = [
      ...monthly.map((item) => item.work),
      ...wall,
      ...yearlyMore.flatMap((group) => group.works),
    ]
    for (const work of works) expect(work.thumbnail).toStartWith("https://")
    const wallIds = wall.map((work) => work.id)
    expect(new Set(wallIds).size).toBe(wallIds.length)
  })

  test("年ごとの続きは 1 人 1 作品で、上位 8 作品と重ならない", () => {
    const topIds = new Set(
      stats.yearlyTopWorks.flatMap((group) => group.works.map((w) => w.id)),
    )
    for (const group of yearlyMore) {
      const names = group.works.map((work) => work.userName)
      expect(new Set(names).size).toBe(names.length)
      for (const work of group.works) expect(topIds.has(work.id)).toBe(false)
    }
  })
})

describe("タイムラインの節目", () => {
  test("累計が節目を越えた月に出る", () => {
    const milestones = findMilestones([
      {
        month: "2022-11",
        works: 6_000,
        registrations: 3_000,
        generations: null,
      },
      {
        month: "2022-12",
        works: 5_000,
        registrations: 8_000,
        generations: null,
      },
    ])
    expect(milestones).toEqual([
      { month: "2022-12", label: "投稿1万件突破", enLabel: "10K posts" },
      { month: "2022-12", label: "登録1万人突破", enLabel: "10K members" },
    ])
  })

  test("本物の数字では節目が月の範囲に収まる", () => {
    const milestones = findMilestones(stats.monthly)
    expect(milestones.length).toBeGreaterThan(3)
    const months = new Set(monthly.map((item) => item.month))
    for (const milestone of milestones) {
      expect(months.has(milestone.month)).toBe(true)
    }
  })
})
