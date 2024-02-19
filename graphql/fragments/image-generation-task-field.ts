import { gql } from "@/graphql/__generated__"

export const imageGenerationTaskFieldsFragment = gql(`
  fragment ImageGenerationTaskFields on ImageGenerationTaskNode {
    id
    prompt
    negativePrompt
    seed
    steps
    scale
    sampler
    sizeType
    t2tImageUrl
    t2tMaskImageUrl
    t2tDenoisingStrengthSize
    t2tInpaintingFillSize
    rating
    completedAt
    status
    isDeleted
    count
    generationType
    model {
      id
      name
      type
    }
    vae
    token
    nanoid
    estimatedSeconds
  }
`)
