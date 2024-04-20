import { GenerationConfigPersistent } from "@/[lang]/generation/_components/generation-config-persistent"
import { GenerationConfigRestoration } from "@/[lang]/generation/_components/generation-config-restoration"
import { GenerationConfigContext } from "@/[lang]/generation/_contexts/generation-config-context"
import { GenerationConfigState } from "@/[lang]/generation/_machines/models/generation-config-state"
import { config } from "@/config"

type Props = {
  children: React.ReactNode
}

/**
 * エディタの設定を提供する
 * @param props
 */
export const GenerationConfigProvider = (props: Props) => {
  // TODO: 後で移動
  const getDefaultNegativePrompt = (modelType: string) => {
    if (modelType === "SD1") {
      return "EasyNegative"
    }
    if (modelType === "SD2") {
      return "Mayng"
    }
    if (modelType === "SDXL") {
      return "negativeXL_D"
    }
    return "EasyNegative"
  }

  const modelType = config.generationFeature.defaultImageModelType

  // TODO: 後で移動
  const cacheStorage = new GenerationConfigState({
    modelId: config.generationFeature.defaultImageModelId,
    modelIds: config.generationFeature.defaultImageModelIds,
    favoriteModelIds: [],
    promptText: "",
    negativePromptText: getDefaultNegativePrompt(modelType),
    sampler: config.generationFeature.defaultSamplerValue,
    scale: config.generationFeature.defaultScaleValue,
    seed: -1,
    sizeType: "SD1_512_768",
    steps: config.generationFeature.defaultStepsValue,
    vae: config.generationFeature.defaultVaeValue,
    modelType: modelType,
    clipSkip: config.generationFeature.defaultClipSkipValue,
    isUseRecommendedPrompt:
      config.generationFeature.defaultIsUseRecommendedPrompt,
    i2iImageBase64: "",
    i2iDenoisingStrengthSize:
      config.generationFeature.defaultI2iDenoisingStrengthSize,
    previewTaskId: null,
    viewTaskId: null,
    viewTaskIds: [],
    thumbnailSizeInPromptView:
      config.generationFeature.defaultThumbnailSizeInPromptView,
    thumbnailSizeInHistoryListFull:
      config.generationFeature.defaultThumbnailSizeInHistoryListFull,
    taskListThumbnailType: config.generationFeature.defaultThumbnailType,
  })

  const stateText =
    typeof window !== "undefined"
      ? localStorage.getItem("generation.state")
      : null

  const snapshot = stateText ? JSON.parse(stateText) : undefined

  return (
    <GenerationConfigContext.Provider
      options={{
        snapshot: snapshot,
        input: cacheStorage,
      }}
    >
      <GenerationConfigPersistent>
        <GenerationConfigRestoration>
          {props.children}
        </GenerationConfigRestoration>
      </GenerationConfigPersistent>
    </GenerationConfigContext.Provider>
  )
}
