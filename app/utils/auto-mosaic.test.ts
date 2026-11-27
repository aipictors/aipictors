import { describe, expect, test } from "bun:test"
import {
  isEdgeSpreadUnhidden,
  isLegLike,
  isTentacleLike,
  measureEdgeSpread,
  mergeDetections,
  minScoreForArea,
  minScoreForLabel,
} from "~/utils/auto-mosaic"

describe("minScoreForLabel", () => {
  test("アヌスは低め、性器はその次、ほかは 0.25", () => {
    expect(minScoreForLabel("anus")).toBe(0.15)
    expect(minScoreForLabel("penis")).toBe(0.22)
    expect(minScoreForLabel("vagina")).toBe(0.22)
    expect(minScoreForLabel("nipple")).toBe(0.25)
  })

  test("minScore を渡したら全部その値", () => {
    expect(minScoreForLabel("anus", 0.5)).toBe(0.5)
    expect(minScoreForLabel("nipple", 0.1)).toBe(0.1)
  })
})

describe("minScoreForArea", () => {
  test("小さい範囲は分類ごとの下限だけ", () => {
    expect(minScoreForArea(0.05)).toBe(0)
  })

  test("大きい範囲ほど高い確からしさを求める（触手を拾って画面の半分にかけない）", () => {
    expect(minScoreForArea(0.1)).toBe(0.5)
    expect(minScoreForArea(0.2)).toBe(0.7)
    expect(minScoreForArea(0.5)).toBe(0.85)
  })

  test("通報作品で大きく写った本物（13% で 0.60、24% で 0.83）は残る", () => {
    expect(0.596).toBeGreaterThanOrEqual(minScoreForArea(0.1335))
    expect(0.829).toBeGreaterThanOrEqual(minScoreForArea(0.2444))
  })
})

describe("isTentacleLike", () => {
  test("触手を含む作品では、確からしさが低いもの・端から伸びているものを外す", () => {
    expect(isTentacleLike(0.6, false)).toBe(true)
    expect(isTentacleLike(0.8, true)).toBe(true)
    expect(isTentacleLike(0.8, false)).toBe(false)
    expect(isTentacleLike(0.92, true)).toBe(false)
  })
})

describe("isLegLike", () => {
  test("細長くて確からしさが低いペニスの検出（脚）を外す", () => {
    // ドレスのスリットから出た脚（実際の誤検出: 63×272 0.49、94×260 0.53）
    expect(isLegLike("penis", 0.49, 63, 272)).toBe(true)
    expect(isLegLike("penis", 0.53, 94, 260)).toBe(true)
    // 横向きでも同じ
    expect(isLegLike("penis", 0.4, 300, 100)).toBe(true)
  })

  test("確からしさが高いもの・ずんぐりしたもの・ペニス以外は残す", () => {
    expect(isLegLike("penis", 0.79, 63, 272)).toBe(false)
    expect(isLegLike("penis", 0.5, 100, 230)).toBe(false)
    expect(isLegLike("vagina", 0.3, 20, 80)).toBe(false)
  })
})

describe("mergeDetections", () => {
  test("大きく重なったものはスコアの高い方だけ、離れたものは両方残す", () => {
    const merged = mergeDetections([
      { score: 0.3, box: [0, 0, 10, 10] as [number, number, number, number] },
      { score: 0.8, box: [1, 1, 11, 11] as [number, number, number, number] },
      { score: 0.5, box: [50, 50, 60, 60] as [number, number, number, number] },
    ])
    expect(merged.map((d) => d.score)).toEqual([0.8, 0.5])
  })
})

/** 幅 w・高さ h の明るさを関数で作る */
const makeLuminance = (
  w: number,
  h: number,
  value: (x: number, y: number) => number,
) => {
  const data = new Float32Array(w * h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) data[y * w + x] = value(x, y)
  }
  return data
}

/** 決まった種から作る、肌の質感のような細かいばらつき */
const noise = (x: number, y: number) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return (n - Math.floor(n)) * 40
}

describe("measureEdgeSpread", () => {
  const size = 120
  const box: [number, number, number, number] = [0, 0, size, size]

  test("隠していない（細かい輪郭が散らばる）は隠れていない", () => {
    const spread = measureEdgeSpread(
      makeLuminance(size, size, (x, y) => 120 + noise(x, y)),
      size,
      size,
      box,
    )
    expect(isEdgeSpreadUnhidden(spread)).toBe(true)
  })

  test("モザイク（マスの境目だけに輪郭）は隠れている", () => {
    const block = 10
    const spread = measureEdgeSpread(
      makeLuminance(size, size, (x, y) =>
        Math.round(
          120 + noise(Math.floor(x / block) * block, Math.floor(y / block)),
        ),
      ),
      size,
      size,
      box,
    )
    expect(spread?.concentration).toBeGreaterThan(0.9)
    expect(isEdgeSpreadUnhidden(spread)).toBe(false)
  })

  test("塗りつぶし・なだらかなぼかしは隠れている", () => {
    expect(
      isEdgeSpreadUnhidden(
        measureEdgeSpread(
          makeLuminance(size, size, () => 0),
          size,
          size,
          box,
        ),
      ),
    ).toBe(false)
    expect(
      isEdgeSpreadUnhidden(
        measureEdgeSpread(
          makeLuminance(size, size, (x, y) => 100 + x * 0.3 + y * 0.2),
          size,
          size,
          box,
        ),
      ),
    ).toBe(false)
  })

  test("狭すぎる範囲は測らない", () => {
    expect(
      measureEdgeSpread(makeLuminance(10, 10, noise), 10, 10, [0, 0, 6, 6]),
    ).toBeNull()
  })
})
