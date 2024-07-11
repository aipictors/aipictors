import { passFieldsFragment } from "@/_graphql/fragments/pass-fields"
import { graphql, type ResultOf } from "gql.tada"
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

export const controlNetCategoriesQuery = graphql(
  `query ControlNetCategories {
    controlNetCategories {
      id
      name
      enName
      contents {
        id
        name
        enName
        module
        sizeKind
        imageUrl
        thumbnailImageUrl
      }
    }
  }`,
)

export const imageLoraModelsQuery = graphql(
  `query ImageLoraModels {
    imageLoraModels {
      id
      name
      description
      license
      prompts
      slug
      thumbnailImageURL
      genre
    }
  }`,
)

export const imageModelsQuery = graphql(
  `query ImageModels {
    imageModels {
      id
      name
      displayName
      category
      description
      license
      prompts
      slug
      style
      thumbnailImageURL
      type
    }
  }`,
)

export const negativePromptCategoriesQuery = graphql(
  `query NegativePromptCategories {
    negativePromptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }`,
)

export const promptCategoriesQuery = graphql(
  `query PromptCategories {
    promptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }`,
)

export const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }`,
  [passFieldsFragment],
)

export const viewerImageGenerationStatusQuery = graphql(
  `query ViewerImageGenerationStatus {
    imageGenerationEngineStatus {
      normalTasksCount
      standardTasksCount
      normalPredictionGenerationWait
      standardPredictionGenerationWait
    }
    viewer {
      remainingImageGenerationTasksCount
      inProgressImageGenerationTasksCount
      inProgressImageGenerationTasksCost
      inProgressImageGenerationReservedTasksCount
      remainingImageGenerationTasksTotalCount
      availableImageGenerationMaxTasksCount
      imageGenerationWaitCount
      availableImageGenerationLoraModelsCount
      availableConsecutiveImageGenerationsCount
    }
  }`,
)
