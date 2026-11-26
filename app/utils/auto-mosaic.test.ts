import { describe, expect, test } from "bun:test"
import {
  isEdgeSpreadUnhidden,
  measureEdgeSpread,
  mergeDetections,
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
