import { describe, expect, test } from "bun:test"
import {
  normalizeCustomSide,
  parseGenerationSize,
  toGenerationSizeInput,
  toTaskSizeType,
} from "~/routes/($lang).generation._index/types/generation-size"
import { getMaxImagesPerRequest } from "~/routes/($lang).generation._index/utils/get-max-images-per-request"
import {
  calcGenerationModelCoinCost,
  getGenerationSizeMultiplier,
} from "~/routes/($lang).generation._index/utils/generation-submit-coin"

describe("幅・高さの指定", () => {
  test("読み取りと依頼の形", () => {
    expect(parseGenerationSize("CUSTOM_1100_1400")).toEqual({
      width: 1100,
      height: 1400,
    })
    expect(toGenerationSizeInput("CUSTOM_1100_1400")).toEqual({
      width: 1100,
      height: 1400,
    })
    expect(toGenerationSizeInput("SD3_1024_1024")).toEqual({
      sizeType: "SD3_1024_1024",
    })
  })

  test("8 の倍数と範囲にそろえる", () => {
    expect(normalizeCustomSide(100)).toBe(512)
    expect(normalizeCustomSide(9999)).toBe(2496)
    expect(normalizeCustomSide(1025)).toBe(1024)
  })

  test("依頼から設定へ戻す", () => {
    expect(
      toTaskSizeType({ sizeType: "SD1_512_768", width: 512, height: 768 }),
    ).toBe("SD1_512_768")
    expect(
      toTaskSizeType({ sizeType: "SD3_1024_1024", width: 1100, height: 1400 }),
    ).toBe("CUSTOM_1100_1400")
    expect(toTaskSizeType({ sizeType: "SD3_1024_1024" })).toBe("SD3_1024_1024")
  })
})

describe("コインと枚数（サーバーと同じ）", () => {
  const coin = (sizeType: string, upscaleSize: number | null = null) =>
    calcGenerationModelCoinCost({
      modelKey: "model",
      modelType: "SDXL",
      generationType: "TEXT_TO_IMAGE",
      upscaleSize,
      sizeType,
    })

  test("今までのサイズは変わらない", () => {
    expect(coin("SD1_512_768")).toBe(10)
    expect(coin("SD3_1024_1024")).toBe(10)
    expect(coin("SD3_1024_1024", 2)).toBe(20)
  })

  test("大きいサイズは面積に応じて増える", () => {
    expect(getGenerationSizeMultiplier("CUSTOM_2048_2048")).toBe(3)
    expect(coin("CUSTOM_2048_2048")).toBe(30)
    expect(coin("CUSTOM_2048_2048", 2)).toBe(60)
    expect(coin("CUSTOM_2496_2496")).toBe(40)
  })

  test("1.6 メガピクセルを超えると 1 枚ずつ", () => {
    const max = (sizeType: string) =>
      getMaxImagesPerRequest({
        modelKey: "model",
        modelType: "SDXL",
        generationType: "TEXT_TO_IMAGE",
        upscaleSize: null,
        hasControlNet: false,
        isPaidPlan: true,
        sizeType,
      })
    expect(max("SD3_1024_1024")).toBe(4)
    expect(max("CUSTOM_1600_1600")).toBe(1)
  })
})
