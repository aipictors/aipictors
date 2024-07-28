import { config } from "~/config"
import { GenerationConfigPersistent } from "~/routes/($lang).generation._index/components/generation-config-persistent"
import { GenerationConfigRestoration } from "~/routes/($lang).generation._index/components/generation-config-restoration"
import { GenerationConfigContext } from "~/routes/($lang).generation._index/contexts/generation-config-context"
import { GenerationConfigState } from "~/routes/($lang).generation._index/machines/models/generation-config-state"

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
    searchModelId: null,
    searchModelName: null,
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
    upscaleSize: 1,
    page: 1,
    controlNetImageBase64: "",
    controlNetMaskImageBase64: "",
    controlNetControlMode: "",
    controlNetEnabled: false,
    controlNetGuidanceEnd: 0,
    controlNetGuidanceStart: 0,
    controlNetPixelPerfect: false,
    controlNetProcessorRes: 0,
    controlNetResizeMode: "",
    controlNetThresholdA: 0.5,
    controlNetThresholdB: 0.5,
    controlNetWeight: 1,
    controlNetModule: null,
    controlNetModel: null,
    controlNetSaveDetectedMap: null,
    controlNetHrOption: null,
    previewImageURL: null,
    currentUserToken: null,
    generationCount: 1,
  })

  const stateText =
    typeof document !== "undefined"
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
