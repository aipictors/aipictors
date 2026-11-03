import { config as appConfig } from "~/config"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"
import type { GeminiImageSize } from "~/types/gemini-image-generation"

/**
 * UIサイズタイプをGeminiImageSizeに変換する
 */
export const convertToGeminiImageSize = (sizeType: string): GeminiImageSize => {
  switch (sizeType) {
    case "SD3_512_512":
    case "SD5_512_512":
      return "SQUARE_512"
    case "SD3_768_768":
    case "SD5_768_768":
      return "SQUARE_768"
    case "SD3_1024_1024":
    case "SD5_1024_1024":
      return "SQUARE_1024"
    case "SD3_1216_832":
      return "LANDSCAPE"
    case "SD3_1280_720":
      return "LANDSCAPE"
    case "SD3_832_1216":
      return "PORTRAIT"
    case "SD3_720_1280":
    case "SD5_720_1280":
      return "PORTRAIT"
    default:
      return "SQUARE_1024"
  }
}

/**
 * Steps が範囲の外なら上限にする
 */
export const toGenerationSteps = (steps: number) => {
  return steps > appConfig.generationFeature.imageGenerationMaxSteps ||
    steps < appConfig.generationFeature.imageGenerationMinSteps
    ? appConfig.generationFeature.imageGenerationMaxSteps
    : steps
}

/**
 * 予約生成の内容
 */
export const toReservedTaskInput = (props: {
  config: GenerationConfigState
  scheduler: string | null
  modelName: string
  seed: number
  controlNetImageUrl: string | null
}) => {
  const { config } = props

  return {
    count: 1,
    model: props.modelName,
    vae: config.vae ?? "",
    prompt: config.promptText,
    isPromptGenerationEnabled:
      config.languageUsedForPrompt === "jp",
    negativePrompt: config.negativePromptText,
    seed: props.seed,
    steps: toGenerationSteps(config.steps),
    scale: config.scale,
    sampler: config.sampler,
    scheduler: props.scheduler,
    clipSkip: config.clipSkip,
    sizeType: config
      .sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
    type: "TEXT_TO_IMAGE" as const,
    controlNetImageUrl: props.controlNetImageUrl,
    controlNetWeight: config.controlNetWeight
      ? Number(config.controlNetWeight)
      : null,
    controlNetModel: config.controlNetModel,
    controlNetModule: config.controlNetModule,
    upscaleSize: config.upscaleSize,
  }
}

/**
 * FLUX の生成の内容
 */
export const toFluxTaskInput = (props: {
  config: GenerationConfigState
  modelName: string
  prompt: string
  seed: number
}) => {
  const { config } = props

  return {
    count: 1,
    prompt: props.prompt,
    isPromptGenerationEnabled:
      config.languageUsedForPrompt === "jp",
    negativePrompt: config.negativePromptText,
    seed: props.seed,
    steps: toGenerationSteps(config.steps),
    scale: config.scale,
    sizeType: config
      .sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
    modelName: props.modelName,
  }
}

/**
 * Gemini の生成の内容
 */
export const toGeminiTaskInput = (props: {
  sizeType: string
  modelName: string
  prompt: string
  i2iFileUrl: string
}) => {
  const { modelName } = props

  return {
    prompt: props.prompt,
    size: convertToGeminiImageSize(props.sizeType),
    imageUrl: props.i2iFileUrl || null,
    model:
      modelName?.toLowerCase().includes("3.1") ||
      modelName?.toLowerCase().includes("nanobanana2") ||
      modelName?.toLowerCase().includes("nano banana 2") ||
      modelName === "GeminiNanoBanana2" ||
      modelName === "gemini-3.1-flash-image-preview"
        ? ("GEMINI_31_FLASH_IMAGE_PREVIEW" as const)
        : ("GEMINI_25_FLASH_IMAGE" as const),
  }
}

/**
 * 通常の生成の内容
 */
export const toImageGenerationTaskInput = (props: {
  config: GenerationConfigState
  scheduler: string | null
  modelName: string
  prompt: string
  seed: number
  imagesPerRequest: number
  generationType: string
  i2iFileUrl: string
  controlNetImageUrl: string | null
}) => {
  const { config } = props

  return {
    // 1 回で作る枚数（サーバー側で上限に収める）
    count: props.imagesPerRequest,
    model: props.modelName,
    vae: config.vae ?? "",
    prompt: props.prompt,
    isPromptGenerationEnabled:
      config.languageUsedForPrompt === "jp",
    negativePrompt: config.negativePromptText,
    seed: props.seed,
    steps: toGenerationSteps(config.steps),
    scale: config.scale,
    sampler: config.sampler,
    scheduler: props.scheduler,
    clipSkip: config.clipSkip,
    sizeType: config
      .sizeType as IntrospectionEnum<"ImageGenerationSizeType">,
    type: props.generationType as IntrospectionEnum<"ImageGenerationType">,
    t2tImageUrl: props.i2iFileUrl,
    t2tDenoisingStrengthSize:
      config.i2iDenoisingStrengthSize.toString(),
    controlNetImageUrl: props.controlNetImageUrl,
    controlNetWeight: config.controlNetWeight
      ? Number(config.controlNetWeight)
      : null,
    controlNetModel: config.controlNetModel,
    controlNetModule: config.controlNetModule,
    upscaleSize: config.upscaleSize,
  }
}
