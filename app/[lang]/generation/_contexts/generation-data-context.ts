"use client"

import {
  ImageLoraModelsQuery,
  ImageModelsQuery,
  PromptCategoriesQuery,
  ViewerCurrentPassQuery,
} from "@/graphql/__generated__/graphql"
import { createContext } from "react"

type Context = {
  promptCategories: PromptCategoriesQuery["promptCategories"]
  models: ImageModelsQuery["imageModels"]
  loraModels: ImageLoraModelsQuery["imageLoraModels"]
  user: NonNullable<ViewerCurrentPassQuery["viewer"]>["user"] | null
  currentPass: NonNullable<ViewerCurrentPassQuery["viewer"]>["currentPass"]
}

export const generationDataContext = createContext<Context>({
  promptCategories: [],
  models: [],
  loraModels: [],
  user: null,
  currentPass: null,
})
