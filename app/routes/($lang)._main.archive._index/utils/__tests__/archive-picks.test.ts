import { describe, expect, test } from "bun:test"
import {
  limitWorksPerUser,
  parseArchivePeriod,
  shuffleWorks,
  toArchiveDateRanges,
  toArchiveYears,
} from "~/routes/($lang)._main.archive._index/utils/archive-picks"

const now = new Date("2026-11-01T12:00:00Z")

describe("過去の名作の期間", () => {
  test("年は開始から今年まで", () => {
    expect(toArchiveYears(now)).toEqual([2026, 2025, 2024, 2023, 2022])
  })

  test("おかしな値は無視する", () => {
    const parse = (text: string) =>
      parseArchivePeriod(new URLSearchParams(text), now)
    expect(parse("year=2023&season=spring")).toEqual({
      year: 2023,
      season: "spring",
    })
    expect(parse("year=1999&season=x")).toEqual({ year: null, season: null })
    expect(parse("")).toEqual({ year: null, season: null })
  })

  test("殿堂は公開から 30 日たった作品まで", () => {
    expect(toArchiveDateRanges({ year: null, season: null }, now)).toEqual([
      { after: null, before: "2026-10-02" },
    ])
  })

  test("今年は 30 日前まで、過去の年はまるごと", () => {
    expect(toArchiveDateRanges({ year: 2026, season: null }, now)).toEqual([
      { after: "2026-01-01", before: "2026-10-02" },
    ])
    expect(toArchiveDateRanges({ year: 2023, season: null }, now)).toEqual([
      { after: "2023-01-01", before: "2024-01-01" },
    ])
  })

  test("冬は年をまたぐ。まだ来ていない季節は空", () => {
    expect(toArchiveDateRanges({ year: 2024, season: "winter" }, now)).toEqual([
      { after: "2024-12-01", before: "2025-03-01" },
    ])
    expect(toArchiveDateRanges({ year: 2026, season: "winter" }, now)).toEqual(
      [],
    )
  })

  test("年を選ばない季節は各年の同じ季節", () => {
    const ranges = toArchiveDateRanges({ year: null, season: "spring" }, now)
    expect(ranges.map((range) => range.after)).toEqual([
      "2026-03-01",
      "2025-03-01",
      "2024-03-01",
      "2023-03-01",
      "2022-03-01",
    ])
  })
})

describe("紹介する作品", () => {
  test("1 人 2 作まで", () => {
    const works = ["a", "a", "b", "a", "b", "c"].map((id, index) => ({
      index,
      user: { id },
    }))
    expect(limitWorksPerUser(works).map((work) => work.index)).toEqual([
      0, 1, 2, 4, 5,
    ])
  })

  test("同じ日は同じ並び、日が変わると変わる。作品は減らない", () => {
    const works = Array.from({ length: 30 }, (_, index) => index)
    const today = shuffleWorks(works, "2026-11-01")
    expect(shuffleWorks(works, "2026-11-01")).toEqual(today)
    expect(shuffleWorks(works, "2026-11-02")).not.toEqual(today)
    expect([...today].sort((a, b) => a - b)).toEqual(works)
  })
})
