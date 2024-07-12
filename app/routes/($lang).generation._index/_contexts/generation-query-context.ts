import { type FragmentOf, graphql } from "gql.tada"
import { createContext } from "react"

type Context = {
  promptCategories: FragmentOf<typeof promptCategoryContextFragment>[]
  negativePromptCategories: FragmentOf<typeof promptCategoryContextFragment>[]
  controlNetCategories: FragmentOf<typeof controlNetCategoryContextFragment>[]
  models: FragmentOf<typeof imageModelContextFragment>[]
  loraModels: FragmentOf<typeof imageLoraModelContextFragment>[]
  user: FragmentOf<typeof imageGenerationUserContextFragment> | null
  currentPass: FragmentOf<typeof imageGenerationPassContextFragment> | null
  engineStatus: FragmentOf<typeof imageGenerationStatusContextFragment>
  viewer: FragmentOf<typeof imageGenerationViewerContextFragment>
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

export const imageGenerationPassContextFragment = graphql(
  `fragment ImageGenerationPassContext on PassNode @_unmask {
    id
    type
    payment {
      id
      amount
      stripePaymentIntentId
    }
    isDisabled
    periodStart
    periodEnd
    trialPeriodStart
    trialPeriodEnd
    createdAt
    price
  }`,
)

export const imageModelContextFragment = graphql(
  `fragment ImageModelContext on ImageModelNode @_unmask {
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
  }`,
)

export const controlNetCategoryContextFragment = graphql(
  `fragment ControlNetCategoryContext on ControlNetCategoryNode @_unmask {
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
  }`,
)

export const promptCategoryContextFragment = graphql(
  `fragment PromptCategoryContext on PromptCategoryNode @_unmask {
    id
    name
    prompts {
      id
      name
      words
    }
  }`,
)

export const imageLoraModelContextFragment = graphql(
  `fragment ImageLoraModelContext on ImageLoraModelNode @_unmask {
    id
    name
    description
    license
    prompts
    slug
    thumbnailImageURL
    genre
  }`,
)

export const imageGenerationUserContextFragment = graphql(
  `fragment ImageGenerationUserContext on UserNode @_unmask {
    id
    nanoid
    hasSignedImageGenerationTerms
  }`,
)

export const currentPassContextFragment = graphql(
  `fragment CurrentPassContext on Viewer @_unmask {
    id
    user {
      id
      nanoid
      hasSignedImageGenerationTerms
    }
    currentPass {
      ...ImageGenerationPassContext
    }
  }`,
  [imageGenerationUserContextFragment, imageGenerationPassContextFragment],
)

export const imageGenerationStatusContextFragment = graphql(
  `fragment ImageGenerationStatusContext on ImageGenerationEngineStatus @_unmask {
    normalTasksCount
    standardTasksCount
    normalPredictionGenerationWait
    standardPredictionGenerationWait
  }`,
)

export const imageGenerationViewerContextFragment = graphql(
  `fragment ImageGenerationViewerContext on Viewer @_unmask {
    remainingImageGenerationTasksCount
    inProgressImageGenerationTasksCount
    inProgressImageGenerationTasksCost
    inProgressImageGenerationReservedTasksCount
    remainingImageGenerationTasksTotalCount
    availableImageGenerationMaxTasksCount
    imageGenerationWaitCount
    availableImageGenerationLoraModelsCount
    availableConsecutiveImageGenerationsCount
  }`,
)
