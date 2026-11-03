import { describe, expect, test } from "bun:test"
import {
  calcGenerationModelCoinCost,
  normalizeCoinSummary,
} from "~/routes/($lang).generation._index/utils/generation-submit-coin"

const cost = (
  modelKey: string,
  overrides: Partial<Parameters<typeof calcGenerationModelCoinCost>[0]> = {},
) =>
  calcGenerationModelCoinCost({
    modelKey,
    modelType: "SD1",
    generationType: "TEXT_TO_IMAGE",
    upscaleSize: null,
    ...overrides,
  })

describe("calcGenerationModelCoinCost", () => {
  test("通常のモデルは 10", () => {
    expect(cost("model")).toBe(10)
  })

  test("高解像度は 2 倍", () => {
    expect(cost("model", { upscaleSize: 2 })).toBe(20)
    expect(cost("model", { upscaleSize: 1 })).toBe(10)
  })

  test("画像から生成は 50（高解像度でも変わらない）", () => {
    expect(cost("model", { generationType: "IMAGE_TO_IMAGE" })).toBe(50)
    expect(
      cost("model", { generationType: "IMAGE_TO_IMAGE", upscaleSize: 2 }),
    ).toBe(50)
  })

  test("FLUX はモデルで決まる（大文字小文字は問わない）", () => {
    expect(cost("flux.1 schnell")).toBe(30)
    expect(cost("FLUX.1 PRO")).toBe(50)
  })

  test("Gemini は 3.1 と Nano Banana 2 が 100、それ以外は 50", () => {
    expect(cost("gemini-2.5-flash-image")).toBe(50)
    expect(cost("gemini-3.1-flash-image-preview")).toBe(100)
    expect(cost("GeminiNanoBanana2")).toBe(100)
    expect(cost("other", { modelType: "GEMINI" })).toBe(50)
  })
})

describe("normalizeCoinSummary", () => {
  const summary = {
    freeBalance: 10,
    premiumBalance: 20,
    totalBalance: 999,
    granted: false,
    grantedFreeCoins: 0,
    grantedPremiumCoins: 0,
  }

  test("null はそのまま", () => {
    expect(normalizeCoinSummary(null)).toBeNull()
  })

  test("合計は足し直す", () => {
    expect(normalizeCoinSummary(summary)?.totalBalance).toBe(30)
  })

  test("マイナスは 0 にする", () => {
    const result = normalizeCoinSummary({ ...summary, freeBalance: -5 })
    expect(result?.freeBalance).toBe(0)
    expect(result?.totalBalance).toBe(20)
  })
})
