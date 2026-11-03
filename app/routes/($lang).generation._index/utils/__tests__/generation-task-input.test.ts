import { describe, expect, test } from "bun:test"
import { config as appConfig } from "~/config"
import type { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import {
  convertToGeminiImageSize,
  toFluxTaskInput,
  toGeminiTaskInput,
  toGenerationSteps,
  toImageGenerationTaskInput,
  toReservedTaskInput,
} from "~/routes/($lang).generation._index/utils/generation-task-input"

const config = {
  vae: null,
  promptText: "prompt",
  negativePromptText: "negative",
  languageUsedForPrompt: "jp",
  steps: 20,
  scale: 7,
  sampler: "sampler",
  clipSkip: 2,
  sizeType: "SD1_512_512",
  i2iDenoisingStrengthSize: 0.5,
  controlNetWeight: 0.5,
  controlNetModel: "model",
  controlNetModule: "module",
  upscaleSize: 2,
} as unknown as GenerationConfigState

describe("convertToGeminiImageSize", () => {
  test("サイズを変換する。知らないものは 1024 の正方形", () => {
    expect(convertToGeminiImageSize("SD3_512_512")).toBe("SQUARE_512")
    expect(convertToGeminiImageSize("SD5_768_768")).toBe("SQUARE_768")
    expect(convertToGeminiImageSize("SD3_1216_832")).toBe("LANDSCAPE")
    expect(convertToGeminiImageSize("SD5_720_1280")).toBe("PORTRAIT")
    expect(convertToGeminiImageSize("unknown")).toBe("SQUARE_1024")
  })
})

describe("toGenerationSteps", () => {
  const { imageGenerationMaxSteps, imageGenerationMinSteps } =
    appConfig.generationFeature

  test("範囲の中はそのまま、外は上限", () => {
    expect(toGenerationSteps(imageGenerationMinSteps)).toBe(
      imageGenerationMinSteps,
    )
    expect(toGenerationSteps(imageGenerationMaxSteps + 1)).toBe(
      imageGenerationMaxSteps,
    )
    expect(toGenerationSteps(imageGenerationMinSteps - 1)).toBe(
      imageGenerationMaxSteps,
    )
  })
})

describe("toGeminiTaskInput", () => {
  const model = (modelName: string) =>
    toGeminiTaskInput({
      sizeType: "SD3_512_512",
      modelName,
      prompt: "p",
      i2iFileUrl: "",
    }).model

  test("名前でモデルを選ぶ", () => {
    expect(model("Gemini 3.1")).toBe("GEMINI_31_FLASH_IMAGE_PREVIEW")
    expect(model("GeminiNanoBanana2")).toBe("GEMINI_31_FLASH_IMAGE_PREVIEW")
    expect(model("Nano Banana 2")).toBe("GEMINI_31_FLASH_IMAGE_PREVIEW")
    expect(model("Gemini 2.5")).toBe("GEMINI_25_FLASH_IMAGE")
  })

  test("画像がなければ null", () => {
    const input = toGeminiTaskInput({
      sizeType: "SD3_512_512",
      modelName: "m",
      prompt: "p",
      i2iFileUrl: "",
    })
    expect(input.imageUrl).toBeNull()
    expect(input.size).toBe("SQUARE_512")
    expect(input.prompt).toBe("p")
  })
})

describe("toImageGenerationTaskInput", () => {
  test("1 回で作る枚数と画像を送る", () => {
    const input = toImageGenerationTaskInput({
      config,
      scheduler: "Automatic",
      modelName: "m",
      prompt: "p",
      seed: 3,
      imagesPerRequest: 4,
      generationType: "IMAGE_TO_IMAGE",
      i2iFileUrl: "https://example.com/i.png",
      controlNetImageUrl: null,
    })
    expect(input.count).toBe(4)
    expect(input.vae).toBe("")
    expect(input.isPromptGenerationEnabled).toBe(true)
    expect(input.type).toBe("IMAGE_TO_IMAGE")
    expect(input.t2tImageUrl).toBe("https://example.com/i.png")
    expect(input.t2tDenoisingStrengthSize).toBe("0.5")
    expect(input.controlNetWeight).toBe(0.5)
    expect(input.scheduler).toBe("Automatic")
  })
})

describe("toReservedTaskInput", () => {
  test("1 枚ずつ文字から生成する", () => {
    const input = toReservedTaskInput({
      config,
      scheduler: null,
      modelName: "m",
      seed: 1,
      controlNetImageUrl: "cn",
    })
    expect(input.count).toBe(1)
    expect(input.type).toBe("TEXT_TO_IMAGE")
    expect(input.prompt).toBe("prompt")
    expect(input.controlNetImageUrl).toBe("cn")
  })

  test("重みが 0 や未設定なら null", () => {
    const input = toReservedTaskInput({
      config: { ...config, controlNetWeight: null } as GenerationConfigState,
      scheduler: null,
      modelName: "m",
      seed: 1,
      controlNetImageUrl: null,
    })
    expect(input.controlNetWeight).toBeNull()
  })
})

describe("toFluxTaskInput", () => {
  test("モデル名とプロンプトを送る", () => {
    const input = toFluxTaskInput({
      config,
      modelName: "flux.1 pro",
      prompt: "p",
      seed: 9,
    })
    expect(input).toMatchObject({
      count: 1,
      prompt: "p",
      seed: 9,
      modelName: "flux.1 pro",
      negativePrompt: "negative",
    })
  })
})
