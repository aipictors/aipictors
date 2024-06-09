import type { controlNetCategoriesQuery } from "@/_graphql/queries/controlnet-category/controlnet-category"
import type { imageLoraModelsQuery } from "@/_graphql/queries/image-model/image-lora-models"
import type { imageModelsQuery } from "@/_graphql/queries/image-model/image-models"
import type { negativePromptCategoriesQuery } from "@/_graphql/queries/negative-prompt-category/negative-prompt-category"
import type { promptCategoriesQuery } from "@/_graphql/queries/prompt-category/prompt-category"
import type { viewerCurrentPassQuery } from "@/_graphql/queries/viewer/viewer-current-pass"
import type { viewerImageGenerationStatusQuery } from "@/_graphql/queries/viewer/viewer-image-generation-status"
import type { ResultOf } from "gql.tada"
import { createContext } from "react"

type Context = {
  promptCategories: ResultOf<typeof promptCategoriesQuery>["promptCategories"]
  negativePromptCategories: ResultOf<
    typeof negativePromptCategoriesQuery
  >["negativePromptCategories"]
  controlNetCategories: ResultOf<
    typeof controlNetCategoriesQuery
  >["controlNetCategories"]
  models: ResultOf<typeof imageModelsQuery>["imageModels"]
  loraModels: ResultOf<typeof imageLoraModelsQuery>["imageLoraModels"]
  user:
    | NonNullable<ResultOf<typeof viewerCurrentPassQuery>["viewer"]>["user"]
    | null
  currentPass: NonNullable<
    ResultOf<typeof viewerCurrentPassQuery>["viewer"]
  >["currentPass"]
  engineStatus: ResultOf<
    typeof viewerImageGenerationStatusQuery
  >["imageGenerationEngineStatus"]
  viewer: NonNullable<
    ResultOf<typeof viewerImageGenerationStatusQuery>["viewer"]
  >
}

export const GenerationQueryContext = createContext<Context>({
  promptCategories: [],
  negativePromptCategories: [],
  controlNetCategories: [],
  models: [],
  loraModels: [],
  user: null,
  currentPass: null,
  engineStatus: {
    normalTasksCount: 0,
    standardTasksCount: 0,
    normalPredictionGenerationWait: 0,
    standardPredictionGenerationWait: 0,
  },
  viewer: {
    remainingImageGenerationTasksCount: 0,
    inProgressImageGenerationTasksCount: 0,
    inProgressImageGenerationTasksCost: 0,
    inProgressImageGenerationReservedTasksCount: 0,
    remainingImageGenerationTasksTotalCount: 0,
    availableImageGenerationMaxTasksCount: 0,
    imageGenerationWaitCount: 0,
    availableImageGenerationLoraModelsCount: 0,
    availableConsecutiveImageGenerationsCount: 0,
  },
})
