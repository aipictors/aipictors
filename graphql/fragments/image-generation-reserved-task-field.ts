import { gql } from "@/graphql/__generated__"

export const imageReservedGenerationTaskFieldsFragment = gql(`
  fragment ImageReservedGenerationTaskFields on ImageGenerationReservedTaskNode {
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
  }
`)
