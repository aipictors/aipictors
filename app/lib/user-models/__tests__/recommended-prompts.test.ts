import { describe, expect, test } from "bun:test"
import {
  addNegativePrompt,
  addQualityPrompt,
} from "~/lib/user-models/recommended-prompts"

describe("おすすめプロンプトを足す", () => {
  test("品質タグは先頭に足す", () => {
    expect(addQualityPrompt("1girl, smile", "masterpiece, best quality")).toBe(
      "masterpiece, best quality, 1girl, smile",
    )
    expect(addQualityPrompt("", "masterpiece")).toBe("masterpiece")
  })

  test("同じタグは足さない（重み付き・大文字も同じ）", () => {
    expect(
      addQualityPrompt("(Masterpiece:1.2), 1girl", "masterpiece, best quality"),
    ).toBe("best quality, (Masterpiece:1.2), 1girl")
    expect(addQualityPrompt("masterpiece", "masterpiece")).toBe("masterpiece")
  })

  test("ネガティブは後ろに足す", () => {
    expect(addNegativePrompt("lowres,", "lowres, bad hands")).toBe(
      "lowres, bad hands",
    )
    expect(addNegativePrompt("", "lowres")).toBe("lowres")
  })

  test("おすすめがなければそのまま", () => {
    expect(addQualityPrompt("1girl", null)).toBe("1girl")
    expect(addNegativePrompt("lowres", undefined)).toBe("lowres")
  })
})
