import { describe, expect, test } from "bun:test"
import {
  getMaxImagesPerRequest,
  resolveImagesPerRequest,
} from "~/routes/($lang).generation._index/utils/get-max-images-per-request"
import {
  getGenerationSizeOptions,
  toRatioLabel,
} from "~/routes/($lang).generation._index/utils/generation-size-options"

const base = {
  modelKey: "lametta",
  modelType: "SD1",
  generationType: "TEXT_TO_IMAGE",
  upscaleSize: null,
  hasControlNet: false,
  isSeedFixed: false,
  isPaidPlan: true,
}

describe("getMaxImagesPerRequest", () => {
  test("プランで 4 枚・無料で 2 枚", () => {
    expect(getMaxImagesPerRequest(base)).toBe(4)
    expect(getMaxImagesPerRequest({ ...base, isPaidPlan: false })).toBe(2)
  })

  test("高解像度・画像から・ControlNet・FLUX は 1 枚", () => {
    expect(getMaxImagesPerRequest({ ...base, upscaleSize: 2 })).toBe(1)
    expect(
      getMaxImagesPerRequest({ ...base, generationType: "IMAGE_TO_IMAGE" }),
    ).toBe(1)
    expect(getMaxImagesPerRequest({ ...base, hasControlNet: true })).toBe(1)
    expect(getMaxImagesPerRequest({ ...base, modelType: "FLUX" })).toBe(1)
    expect(getMaxImagesPerRequest({ ...base, isSeedFixed: true })).toBe(1)
  })
})

describe("resolveImagesPerRequest", () => {
  test("未選択はまとめて（上限）・選んだ数は上限まで", () => {
    expect(resolveImagesPerRequest(null, 4)).toBe(4)
    expect(resolveImagesPerRequest(1, 4)).toBe(1)
    expect(resolveImagesPerRequest(3, 2)).toBe(2)
  })
})

describe("サイズの選択肢", () => {
  test("比率の表記", () => {
    expect(toRatioLabel(832, 1216)).toBe("2:3")
    expect(toRatioLabel(1024, 1024)).toBe("1:1")
    expect(toRatioLabel(640, 1536)).toBe("5:12")
  })

  test("縦長から横長の順", () => {
    expect(getGenerationSizeOptions("SDXL").map((o) => o.ratioLabel)).toEqual([
      "5:12",
      "2:3",
      "1:1",
      "3:2",
      "12:5",
    ])
  })
})
