import { describe, expect, test } from "bun:test"
import {
  parseCompletedAt,
  toGenerationImageFileNames,
} from "~/routes/($lang).generation._index/utils/to-generation-image-file-names"

// タイムゾーンに依存しないようにUTCで整形する
const formatUtc = (date: Date) =>
  date.toISOString().slice(0, 19).replace(/-|:/g, "").replace("T", "-")

describe("toGenerationImageFileNames", () => {
  test("生成日時の古い順に連番を付ける（返り値は入力順）", () => {
    const names = toGenerationImageFileNames(
      [
        { completedAt: 1793070000, extension: "png" },
        { completedAt: 1793060000, extension: "webp" },
        { completedAt: 1793065000, extension: "png" },
      ],
      formatUtc,
    )
    expect(names).toEqual([
      "20261027-030000_003.png",
      "20261027-001320_001.webp",
      "20261027-013640_002.png",
    ])
  })

  test("同じ日時は入力順、日時不明は末尾", () => {
    const names = toGenerationImageFileNames(
      [
        { completedAt: null, extension: "png" },
        { completedAt: 1793060000, extension: "png" },
        { completedAt: 1793060000, extension: "png" },
      ],
      formatUtc,
    )
    expect(names).toEqual([
      "unknown_003.png",
      "20261027-001320_001.png",
      "20261027-001320_002.png",
    ])
  })

  test("1000件以上なら桁数を増やしてファイル名が一意になる", () => {
    const items = Array.from({ length: 1000 }, () => ({
      completedAt: 1793060000,
      extension: "png",
    }))
    const names = toGenerationImageFileNames(items, formatUtc)
    expect(names[0]).toBe("20261027-001320_0001.png")
    expect(new Set(names).size).toBe(1000)
  })

  test("ファイル名順に並べると生成順になる", () => {
    const items = [5, 3, 9, 1].map((n) => ({
      completedAt: 1793060000 + n,
      extension: "png",
    }))
    const names = toGenerationImageFileNames(items, formatUtc)
    const sorted = [...names].sort()
    expect(sorted.map((name) => names.indexOf(name))).toEqual([3, 1, 0, 2])
  })
})

describe("parseCompletedAt", () => {
  test("秒・ミリ秒・不正値", () => {
    expect(parseCompletedAt("1793060000")).toBe(1793060000)
    expect(parseCompletedAt("1793060000123")).toBe(1793060000)
    expect(parseCompletedAt(undefined)).toBeNull()
    expect(parseCompletedAt("")).toBeNull()
    expect(parseCompletedAt("abc")).toBeNull()
    expect(parseCompletedAt("0")).toBeNull()
  })
})
