import { describe, expect, test } from "bun:test"
import {
  applyColorKeyToPixels,
  hexToRgb,
  normalizeHexColor,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-color"

describe("normalizeHexColor", () => {
  test("6 桁はそのまま小文字にする", () => {
    expect(normalizeHexColor(" #AABBCC ")).toBe("#aabbcc")
  })

  test("3 桁は 6 桁に広げる", () => {
    expect(normalizeHexColor("#abc")).toBe("#aabbcc")
  })

  test("色でなければ白にする", () => {
    expect(normalizeHexColor("red")).toBe("#ffffff")
    expect(normalizeHexColor("#12345")).toBe("#ffffff")
  })
})

describe("hexToRgb", () => {
  test("数値に分ける", () => {
    expect(hexToRgb("#102030")).toEqual({ r: 16, g: 32, b: 48 })
  })
})

describe("applyColorKeyToPixels", () => {
  const run = (pixel: number[], colorKey: string, threshold: number) => {
    const data = new Uint8ClampedArray(pixel)
    applyColorKeyToPixels({ data, colorKey, threshold })
    return Array.from(data)
  }

  test("許容範囲の中は透明にする", () => {
    expect(run([250, 250, 250, 255], "#ffffff", 40)).toEqual([250, 250, 250, 0])
  })

  test("許容範囲のすぐ外はなだらかに薄くする", () => {
    // 距離 8、しきい値 0、ぼかし 16 なので半分
    expect(run([255, 255, 247, 200], "#ffffff", 0)).toEqual([255, 255, 247, 100])
  })

  test("遠い色と透明なピクセルはそのまま", () => {
    expect(run([0, 0, 0, 255], "#ffffff", 40)).toEqual([0, 0, 0, 255])
    expect(run([255, 255, 255, 0], "#ffffff", 40)).toEqual([255, 255, 255, 0])
  })

  test("しきい値は 0〜441 に収める", () => {
    // 黒と白の距離は約 441.67 なので、上限の 441 でもわずかに残る
    expect(run([0, 0, 0, 255], "#ffffff", 9999)).toEqual([0, 0, 0, 11])
    expect(run([255, 255, 255, 255], "#ffffff", -5)).toEqual([255, 255, 255, 0])
  })
})
