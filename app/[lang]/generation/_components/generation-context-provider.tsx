"use client"

import { GenerationStatePersistent } from "@/app/[lang]/generation/_components/generation-state-persistent"
import { GenerationConfigContext } from "@/app/[lang]/generation/_contexts/generation-config-context"
import { GenerationDataContext } from "@/app/[lang]/generation/_contexts/generation-data-context"
import { activeImageGeneration } from "@/app/[lang]/generation/_functions/active-image-generation"
import { GenerationConfigState } from "@/app/[lang]/generation/_machines/models/generation-config-state"
import { AuthContext } from "@/app/_contexts/auth-context"
import { config } from "@/config"
import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoriesQuery,
} from "@/graphql/__generated__/graphql"
import { viewerCurrentPassQuery } from "@/graphql/queries/viewer/viewer-current-pass"
import { useQuery } from "@apollo/client"
import { useContext, useEffect } from "react"

type Props = {
  promptCategories: PromptCategoriesQuery["promptCategories"]
  imageModels: ImageModelsQuery["imageModels"]
  imageLoraModels: ImageLoraModelsQuery["imageLoraModels"]
  children: React.ReactNode
}

export const GenerationContextProvider = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: viewer, refetch } = useQuery(viewerCurrentPassQuery, {
    skip: authContext.isNotLoggedIn,
  })

  const userNanoid = viewer?.viewer?.user.nanoid ?? null

  useEffect(() => {
    if (userNanoid === null) return
    activeImageGeneration({ nanoid: userNanoid })
  }, [userNanoid])

  useEffect(() => {
    if (authContext.isLoading) return
    if (authContext.isNotLoggedIn) return
    // ログイン状態が変わったら再取得
    refetch()
  }, [authContext.isLoggedIn])

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

  const snapshot = JSON.parse(localStorage.getItem("generation.state") ?? "{}")

  return (
    <GenerationDataContext.Provider
      value={{
        promptCategories: props.promptCategories,
        models: props.imageModels,
        loraModels: props.imageLoraModels,
        user: viewer?.viewer?.user ?? null,
        currentPass: viewer?.viewer?.currentPass ?? null,
      }}
    >
      <GenerationConfigContext.Provider
        options={{
          snapshot: snapshot,
          input: cacheStorage,
        }}
      >
        <GenerationStatePersistent>{props.children}</GenerationStatePersistent>
      </GenerationConfigContext.Provider>
    </GenerationDataContext.Provider>
  )
}
