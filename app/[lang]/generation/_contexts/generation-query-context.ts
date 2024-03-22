"use client"

import type {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoriesQuery,
  ViewerCurrentPassQuery,
  ViewerImageGenerationStatusQuery,
} from "@/graphql/__generated__/graphql"
import { createContext } from "react"

type Context = {
  promptCategories: PromptCategoriesQuery["promptCategories"]
  models: ImageModelsQuery["imageModels"]
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
  user: NonNullable<ViewerCurrentPassQuery["viewer"]>["user"] | null
  currentPass: NonNullable<ViewerCurrentPassQuery["viewer"]>["currentPass"]
  engineStatus: ViewerImageGenerationStatusQuery["imageGenerationEngineStatus"]
  viewer: NonNullable<ViewerImageGenerationStatusQuery["viewer"]>
}

export const GenerationQueryContext = createContext<Context>({
  promptCategories: [],
  models: [],
  loraModels: [],
  user: null,
  currentPass: null,
  engineStatus: {
    normalTasksCount: 0,
    standardTasksCount: 0,
    normalPredictionGenerationSeconds: 0,
    standardPredictionGenerationSeconds: 0,
  },
  viewer: {
    remainingImageGenerationTasksCount: 0,
    inProgressImageGenerationTasksCount: 0,
    inProgressImageGenerationReservedTasksCount: 0,
    remainingImageGenerationTasksTotalCount: 0,
    availableImageGenerationMaxTasksCount: 0,
    imageGenerationWaitCount: 0,
    availableImageGenerationLoraModelsCount: 0,
    availableConsecutiveImageGenerationsCount: 0,
  },
})
