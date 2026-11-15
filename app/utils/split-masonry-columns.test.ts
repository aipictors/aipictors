import { describe, expect, test } from "bun:test"
import {
  splitMasonryColumns,
  toMasonryAspectRatio,
} from "~/utils/split-masonry-columns"

describe("toMasonryAspectRatio", () => {
  test("縦横比を範囲に収める", () => {
    expect(toMasonryAspectRatio(1000, 1000)).toBe(1)
    expect(toMasonryAspectRatio(100, 1000)).toBe(0.56)
    expect(toMasonryAspectRatio(3000, 1000)).toBe(1.78)
  })

  test("サイズが分からないときは正方形", () => {
    expect(toMasonryAspectRatio(0, 0)).toBe(1)
    expect(toMasonryAspectRatio(Number.NaN, 100)).toBe(1)
  })
})

describe("splitMasonryColumns", () => {
  test("いちばん短い列に足す", () => {
    // 縦長（高さ 2）・正方形（1）・正方形（1）・正方形（1）
    const ratios = [0.5, 1, 1, 1]
    const columns = splitMasonryColumns(ratios, 2, (r) => r)
    expect(columns.map((c) => c.map((v) => v.index))).toEqual([
      [0, 3],
      [1, 2],
    ])
  })

  test("同じ高さなら左から交互に入る", () => {
    const columns = splitMasonryColumns([1, 1, 1, 1], 2, (r) => r, 0.2)
    expect(columns.map((c) => c.map((v) => v.index))).toEqual([
      [0, 2],
      [1, 3],
    ])
  })

  test("空でも列の数だけ返す", () => {
    expect(splitMasonryColumns([], 2, () => 1)).toEqual([[], []])
  })
})
