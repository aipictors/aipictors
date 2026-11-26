import { describe, expect, test } from "bun:test"
import {
  AI_ANALYSIS_IMAGE_MAX_SIDE,
  toAiAnalysisImageSize,
} from "~/utils/to-ai-analysis-image"
import { dataUrlToBytes } from "~/utils/upload-public-image"

describe("toAiAnalysisImageSize", () => {
  test("小さい画像はそのまま", () => {
    expect(toAiAnalysisImageSize(1024, 768)).toEqual({
      width: 1024,
      height: 768,
    })
  })

  test("長辺を上限に合わせて縦横比を保つ", () => {
    expect(toAiAnalysisImageSize(4096, 2048)).toEqual({
      width: AI_ANALYSIS_IMAGE_MAX_SIDE,
      height: AI_ANALYSIS_IMAGE_MAX_SIDE / 2,
    })
    expect(toAiAnalysisImageSize(1000, 6000)).toEqual({
      width: 256,
      height: AI_ANALYSIS_IMAGE_MAX_SIDE,
    })
  })
})

describe("dataUrlToBytes", () => {
  test("base64 の中身をバイト列にする", () => {
    const bytes = new Uint8Array([0, 1, 127, 128, 254, 255])
    const dataUrl = `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`
    expect(Array.from(dataUrlToBytes(dataUrl))).toEqual(Array.from(bytes))
  })
})
