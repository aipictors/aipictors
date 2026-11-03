import { describe, expect, test } from "bun:test"
import {
  clampFontWeight,
  computeTextLayerBox,
  getFontWeightsForFamily,
  normalizeFontWeightForFamily,
  normalizeVerticalPreviewText,
  splitLines,
  toVerticalColumns,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-text-layout"

const roundedFont = "'M PLUS Rounded 1c', system-ui"
const handwritingFont = "'Yomogi', system-ui"

describe("フォントの太さ", () => {
  test("フォントごとの太さ", () => {
    expect(getFontWeightsForFamily(roundedFont)).toEqual([400, 700, 900])
    expect(getFontWeightsForFamily("unknown")).toEqual([400])
  })

  test("使えない太さは近いものにする", () => {
    expect(
      normalizeFontWeightForFamily({ fontFamily: roundedFont, fontWeight: 600 }),
    ).toBe(700)
    expect(
      normalizeFontWeightForFamily({ fontFamily: roundedFont, fontWeight: 700 }),
    ).toBe(700)
    expect(
      normalizeFontWeightForFamily({
        fontFamily: handwritingFont,
        fontWeight: 900,
      }),
    ).toBe(400)
  })

  test("100 刻みで 100〜900 に収める", () => {
    expect(clampFontWeight(449)).toBe(400)
    expect(clampFontWeight(50)).toBe(100)
    expect(clampFontWeight(1200)).toBe(900)
  })
})

describe("縦書き", () => {
  test("改行は \\n も \\r\\n も分ける", () => {
    expect(splitLines("a\nb\r\nc")).toEqual(["a", "b", "c"])
  })

  test("複数文字の行は列のまま", () => {
    expect(toVerticalColumns("あい\nう")).toEqual(["あい", "う"])
  })

  test("1 行 1 文字は 1 列にまとめる", () => {
    expect(toVerticalColumns("あ\nい\nう")).toEqual(["あいう"])
    expect(toVerticalColumns("あ\n\nう")).toEqual(["あ　う"])
    expect(normalizeVerticalPreviewText("あ\nい")).toBe("あい")
    expect(normalizeVerticalPreviewText("あい\nう")).toBe("あい\nう")
  })
})

describe("computeTextLayerBox", () => {
  test("横書きは幅 260 で、行が多いと高さが伸びる", () => {
    expect(
      computeTextLayerBox({ text: "a", fontSize: 64, vertical: false }),
    ).toEqual({ width: 260, height: 140 })
    expect(
      computeTextLayerBox({ text: "a\nb\nc", fontSize: 64, vertical: false }),
    ).toEqual({ width: 260, height: 223 })
  })

  test("縦書きは列と文字数で決まる", () => {
    expect(
      computeTextLayerBox({ text: "あいう", fontSize: 64, vertical: true }),
    ).toEqual({ width: 82, height: 223 })
  })

  test("キャンバスの大きさを超えない", () => {
    const box = computeTextLayerBox({
      text: "あいうえおかきくけこ",
      fontSize: 200,
      vertical: true,
    })
    expect(box.height).toBe(512)
  })
})
