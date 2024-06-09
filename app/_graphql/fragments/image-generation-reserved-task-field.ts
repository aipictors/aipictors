import { graphql } from "gql.tada"

export const imageReservedGenerationTaskFieldsFragment = graphql(
  `fragment ImageReservedGenerationTaskFields on ImageGenerationReservedTaskNode @_unmask {
    id
    prompt
    negativePrompt
    seed
    steps
    scale
    sampler
    clipSkip
    sizeType
    t2tImageUrl
    t2tMaskImageUrl
    t2tDenoisingStrengthSize
    t2tInpaintingFillSize
    createdAt
    isDeleted
    generationType
    model {
      id
      name
      type
    }
    vae
    token
    nanoid
    upscaleSize
  }`,
)
