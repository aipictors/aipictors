import { gql } from "@apollo/client"

export default gql`
  fragment ImageGenerationTaskFields on ImageGenerationTaskNode {
    id
    prompt
    negativePrompt
    # seed
    steps
    scale
    sampler
    # sizeType
    t2tImageBlob
    t2tMaskImageBlob
    t2tDenoisingStrengthSize
    imageURL
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
