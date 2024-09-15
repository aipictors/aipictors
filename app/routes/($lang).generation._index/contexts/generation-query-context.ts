import { type FragmentOf, graphql } from "gql.tada"
import { createContext } from "react"

type Context = {
  promptCategories: FragmentOf<typeof PromptCategoryContextFragment>[]
  negativePromptCategories: FragmentOf<
    typeof NegativePromptCategoryContextFragment
  >[]
  controlNetCategories: FragmentOf<typeof ControlNetCategoryContextFragment>[]
  imageModels: FragmentOf<typeof ImageModelContextFragment>[]
  imageLoraModels: FragmentOf<typeof ImageLoraModelContextFragment>[]
  user: FragmentOf<typeof ImageGenerationUserContextFragment> | null
  currentPass: FragmentOf<typeof CurrentPassContextFragment> | null
  engineStatus: FragmentOf<
    typeof ImageGenerationEngineStatusContextFragment
  > | null
  userStatus: FragmentOf<typeof ImageGenerationUserStatusContextFragment> | null
}

export const GenerationQueryContext = createContext<Context>({
  promptCategories: [],
  negativePromptCategories: [],
  controlNetCategories: [],
  imageModels: [],
  imageLoraModels: [],
  currentPass: null,
  user: null,
  engineStatus: null,
  userStatus: null,
})

export const ImageModelContextFragment = graphql(
  `fragment ImageModelContextFragment on ImageModelNode @_unmask {
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

export const ControlNetCategoryContextFragment = graphql(
  `fragment ControlNetCategoryContextFragment on ControlNetCategoryNode @_unmask {
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

export const PromptCategoryContextFragment = graphql(
  `fragment PromptCategoryContextFragment on PromptCategoryNode @_unmask {
    id
    name
    prompts {
      id
      name
      words
    }
  }`,
)

export const NegativePromptCategoryContextFragment = graphql(
  `fragment NegativePromptCategoryContextFragment on PromptCategoryNode @_unmask {
    id
    name
    prompts {
      id
      name
      words
    }
  }`,
)

export const ImageLoraModelContextFragment = graphql(
  `fragment ImageLoraModelContextFragment on ImageLoraModelNode @_unmask {
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

export const ImageGenerationUserContextFragment = graphql(
  `fragment ImageGenerationUserContextFragment on UserNode @_unmask {
    id
    nanoid
    hasSignedImageGenerationTerms
  }`,
)

export const CurrentPassContextFragment = graphql(
  `fragment CurrentPassContextFragment on PassNode @_unmask {
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
  [],
)

export const ImageGenerationEngineStatusContextFragment = graphql(
  `fragment ImageGenerationEngineStatusContextFragment on ImageGenerationEngineStatus @_unmask {
    normalTasksCount
    standardTasksCount
    normalPredictionGenerationWait
    standardPredictionGenerationWait
  }`,
)

export const ImageGenerationUserStatusContextFragment = graphql(
  `fragment ImageGenerationUserStatusContextFragment on Viewer @_unmask {
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
