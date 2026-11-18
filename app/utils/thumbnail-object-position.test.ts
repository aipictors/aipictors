import { describe, expect, test } from "bun:test"
import { toThumbnailObjectPosition } from "~/utils/thumbnail-object-position"

describe("toThumbnailObjectPosition", () => {
  test("調整の画面の中央の値は中央になる", () => {
    // 縦長 400x711 の中央は -(1 - 400 / 711) × 50 ≒ -21.875
    expect(toThumbnailObjectPosition(-21.875, 400, 711)).toBe("50% 50.01%")
    // 横長 600x400 の中央は -((600 / 400 - 1) / (2 × 600 / 400)) × 100
    expect(toThumbnailObjectPosition(-100 / 6, 600, 400)).toBe("50% 50%")
  })

  test("端まで動かした値はその端になる", () => {
    // 縦長 400x600: はみ出しは 1/3。いちばん下は -33.33
    expect(toThumbnailObjectPosition(0, 400, 600)).toBe("50% 0%")
    expect(toThumbnailObjectPosition(-100 / 3, 400, 600)).toBe("50% 100%")
    // 横長 600x400 のいちばん右
    expect(toThumbnailObjectPosition(-100 / 3, 600, 400)).toBe("100% 50%")
  })

  test("範囲の外・不正な値は端に収める", () => {
    expect(toThumbnailObjectPosition(-80, 400, 600)).toBe("50% 100%")
    expect(toThumbnailObjectPosition(20, 400, 600)).toBe("50% 0%")
    expect(toThumbnailObjectPosition(null, 400, 600)).toBe("50% 0%")
    expect(toThumbnailObjectPosition(Number.NaN, 600, 400)).toBe("0% 50%")
  })

  test("正方形やサイズが分からない画像は中央", () => {
    expect(toThumbnailObjectPosition(-10, 400, 400)).toBe("50% 50%")
    expect(toThumbnailObjectPosition(-10, 0, 400)).toBe("50% 50%")
  })
})
