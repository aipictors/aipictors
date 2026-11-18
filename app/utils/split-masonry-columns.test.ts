import { describe, expect, test } from "bun:test"
import {
  splitMasonryBlocks,
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

describe("splitMasonryBlocks", () => {
  const toIndexes = (blocks: ReturnType<typeof splitMasonryBlocks<number>>) =>
    blocks.map((block) =>
      block.kind === "wide"
        ? { wide: block.items.map((v) => v.index) }
        : { columns: block.columns.map((c) => c.map((v) => v.index)) },
    )

  test("横長の作品は列がそろったところで 2 列ぶち抜きの行にする", () => {
    // 正方形・正方形・横長・正方形・正方形
    const ratios = [1, 1, 1.6, 1, 1]
    expect(toIndexes(splitMasonryBlocks(ratios, 2, (r) => r))).toEqual([
      { columns: [[0], [1]] },
      { wide: [2] },
      { columns: [[3], [4]] },
    ])
  })

  test("列の高さがずれているときは、そろうまで横長の行を後ろに送る", () => {
    // 縦長（高さ 2）・横長・正方形・正方形
    const ratios = [0.5, 1.6, 1, 1]
    expect(toIndexes(splitMasonryBlocks(ratios, 2, (r) => r))).toEqual([
      { columns: [[0], [2, 3]] },
      { wide: [1] },
    ])
  })

  test("横長がないときは splitMasonryColumns と同じ", () => {
    const ratios = [0.5, 1, 1, 1]
    expect(toIndexes(splitMasonryBlocks(ratios, 2, (r) => r))).toEqual([
      {
        columns: splitMasonryColumns(ratios, 2, (r) => r).map((c) =>
          c.map((v) => v.index),
        ),
      },
    ])
  })

  test("列が多いときは横長を 1 行に列の数の半分まで並べる", () => {
    const ratios = [1.6, 1.6, 1.6, 1.6]
    expect(toIndexes(splitMasonryBlocks(ratios, 6, (r) => r))).toEqual([
      { wide: [0, 1, 2] },
      { wide: [3] },
    ])
  })

  test("すべての作品を 1 回ずつ含む", () => {
    const ratios = [0.6, 1.5, 0.7, 1.8, 1, 0.56, 1.4, 1.2, 0.8, 1.7]
    for (const count of [1, 2, 3, 4, 6]) {
      const indexes = splitMasonryBlocks(ratios, count, (r) => r)
        .flatMap((block) =>
          block.kind === "wide"
            ? block.items.map((v) => v.index)
            : block.columns.flat().map((v) => v.index),
        )
        .sort((a, b) => a - b)
      expect(indexes).toEqual(ratios.map((_, i) => i))
    }
  })
})
