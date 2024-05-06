import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoriesQuery,
  NegativePromptCategoriesQuery,
  ViewerCurrentPassQuery,
  ViewerImageGenerationStatusQuery,
  ControlNetCategoriesQuery,
} from "@/_graphql/__generated__/graphql"
import { createContext } from "react"

type Context = {
  promptCategories: PromptCategoriesQuery["promptCategories"]
  negativePromptCategories: NegativePromptCategoriesQuery["negativePromptCategories"]
  controlNetCategories: ControlNetCategoriesQuery["controlNetCategories"]
  models: ImageModelsQuery["imageModels"]
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
  user: NonNullable<ViewerCurrentPassQuery["viewer"]>["user"] | null
  currentPass: NonNullable<ViewerCurrentPassQuery["viewer"]>["currentPass"]
  engineStatus: ViewerImageGenerationStatusQuery["imageGenerationEngineStatus"]
  viewer: NonNullable<ViewerImageGenerationStatusQuery["viewer"]>
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
