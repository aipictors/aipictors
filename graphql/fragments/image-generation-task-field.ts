import { gql } from "@apollo/client"

export const imageGenerationTaskFieldsFragment = gql`
  fragment ImageGenerationTaskFields on ImageGenerationTaskNode {
    id
    prompt
    negativePrompt
    seed
    steps
    scale
    sampler
    sizeType
    t2tImageBlob
    t2tMaskImageBlob
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
    }
    vae
    token
  }
`
