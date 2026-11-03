import { describe, expect, test } from "bun:test"
import { findGenerationSubmitBlock } from "~/routes/($lang).generation._index/utils/find-generation-submit-block"
import type { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"

const config = (overrides: Partial<GenerationConfigState>) =>
  ({
    modelId: "model",
    modelType: "SD1",
    sizeType: "SD1_512_768",
    i2iImageBase64: null,
    generationCount: 1,
    controlNetImageBase64: null,
    upscaleSize: null,
    controlNetWeight: null,
    controlNetModule: null,
    ...overrides,
  }) as GenerationConfigState

const find = (
  overrides: Partial<GenerationConfigState>,
  props: Partial<Parameters<typeof findGenerationSubmitBlock>[0]> = {},
) =>
  findGenerationSubmitBlock({
    config: config(overrides),
    passType: "PREMIUM",
    generationType: "TEXT_TO_IMAGE",
    inProgressImageGenerationTasksCount: 0,
    maxTasksCount: 3,
    ...props,
  })

describe("findGenerationSubmitBlock", () => {
  test("問題がなければ null", () => {
    expect(find({})).toBeNull()
    expect(find({}, { passType: undefined })).toBeNull()
  })

  test("Nano Banana はライト以上", () => {
    const modelId = "gemini-2.5-flash-image"
    expect(find({ modelId }, { passType: null })?.log.message).toContain(
      "Gemini Nano Banana",
    )
    expect(find({ modelId }, { passType: "LITE" })).toBeNull()
  })

  test("画像から生成はライト以上。GEMINI はプランを問わない", () => {
    const i2iImageBase64 = "base64"
    expect(find({ i2iImageBase64 }, { passType: null })?.toast).toContain(
      "img2img",
    )
    expect(find({ i2iImageBase64 }, { passType: "LITE" })).toBeNull()
    expect(
      find({ i2iImageBase64, modelType: "GEMINI" }, { passType: null }),
    ).toBeNull()
  })

  test("複数回と同時生成はスタンダード以上", () => {
    expect(
      find({ generationCount: 2 }, { passType: "LITE" })?.log.details,
    ).toEqual({ count: 2 })
    expect(find({ generationCount: 2 }, { passType: "STANDARD" })).toBeNull()
    expect(
      find(
        {},
        { passType: "LITE", inProgressImageGenerationTasksCount: 1 },
      )?.toast,
    ).toContain("複数枚同時生成")
  })

  test("画像から生成は同時生成の上限を超えない", () => {
    const props = {
      generationType: "IMAGE_TO_IMAGE" as const,
      inProgressImageGenerationTasksCount: 2,
    }
    expect(find({ generationCount: 2 }, props)?.toast).toBe(
      "同時生成枚数の上限です。",
    )
    expect(find({ generationCount: 1 }, props)).toBeNull()
  })

  test("ControlNet の組み合わせ", () => {
    expect(
      find({ generationCount: 2, controlNetImageBase64: "cn" })?.toast,
    ).toContain("1枚ずつ")
    expect(find({ controlNetImageBase64: "cn" })?.toast).toContain(
      "詳細設定が完了していません",
    )
    expect(
      find({
        controlNetImageBase64: "cn",
        controlNetWeight: 0.5,
        controlNetModule: "module",
      }),
    ).toBeNull()
  })

  test("スマホで上に出すものを分ける", () => {
    expect(
      find({ modelType: "FLUX", controlNetImageBase64: "cn" })
        ?.isTopCenterOnMobile,
    ).toBe(true)
    expect(
      find({ modelType: "FLUX", i2iImageBase64: "b" })?.isTopCenterOnMobile,
    ).toBe(true)
    expect(
      find({ upscaleSize: 2, i2iImageBase64: "b" })?.isTopCenterOnMobile,
    ).toBe(true)
    expect(
      find({ controlNetImageBase64: "cn" })?.isTopCenterOnMobile,
    ).toBeUndefined()
  })

  test("先に当たった理由を返す", () => {
    expect(
      find(
        { i2iImageBase64: "b", generationCount: 2 },
        { passType: null },
      )?.log.message,
    ).toBe("Blocked: IMG2IMG requires LITE+")
  })

  test("サブスクでなければ出力は 2048×2048 まで", () => {
    const free = { passType: null }
    expect(find({ sizeType: "CUSTOM_2048_2048" }, free)).toBeNull()
    expect(find({ sizeType: "CUSTOM_2056_2048" }, free)?.log.message).toBe(
      "Blocked: size over free limit",
    )
    expect(
      find({ sizeType: "CUSTOM_1024_1024", upscaleSize: 2 }, free),
    ).toBeNull()
    expect(
      find({ sizeType: "CUSTOM_1032_1024", upscaleSize: 2 }, free)?.log.message,
    ).toBe("Blocked: size over free limit")
    expect(find({ sizeType: "CUSTOM_2496_2496", upscaleSize: 2 })).toBeNull()
  })
})
