import { describe, expect, test } from "bun:test"
import {
  buildCssFilter,
  clampNumber,
  hashStringToUint32,
  mulberry32,
  normalizeLayerEffects,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-layer-effects"

describe("normalizeLayerEffects", () => {
  test("未指定は既定の値にする", () => {
    expect(normalizeLayerEffects()).toEqual({
      blur: 0,
      invert: false,
      sparkle: { enabled: false, intensity: 0.6 },
    })
  })

  test("範囲の外は収める", () => {
    const effects = normalizeLayerEffects({
      blur: 99,
      sparkle: { enabled: true, intensity: 3 },
    })
    expect(effects.blur).toBe(20)
    expect(effects.sparkle).toEqual({ enabled: true, intensity: 1 })
  })
})

describe("buildCssFilter", () => {
  test("何もなければ undefined", () => {
    expect(buildCssFilter()).toBeUndefined()
    expect(buildCssFilter({ blur: 0, invert: false })).toBeUndefined()
  })

  test("ブラーと色反転をつなげる", () => {
    expect(buildCssFilter({ blur: 3, invert: true })).toBe("blur(3px) invert(1)")
  })
})

describe("clampNumber", () => {
  test("範囲に収める", () => {
    expect(clampNumber(5, 0, 3)).toBe(3)
    expect(clampNumber(-1, 0, 3)).toBe(0)
    expect(clampNumber(2, 0, 3)).toBe(2)
  })
})

describe("キラキラの乱数", () => {
  test("同じ文字列なら同じ並びになる（表示と書き出しで模様を揃えるため）", () => {
    const a = mulberry32(hashStringToUint32("layer-1"))
    const b = mulberry32(hashStringToUint32("layer-1"))
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  test("0 以上 1 未満", () => {
    const rand = mulberry32(hashStringToUint32("layer-2"))
    for (let i = 0; i < 100; i += 1) {
      const value = rand()
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })

  test("FNV-1a のハッシュ", () => {
    expect(hashStringToUint32("")).toBe(2166136261)
    expect(hashStringToUint32("a")).toBe(3826002220)
  })
})
