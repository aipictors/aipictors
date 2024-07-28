import { graphql } from "gql.tada"

export const imageGenerationTaskFieldsFragment = graphql(
  `fragment ImageGenerationTaskFields on ImageGenerationTaskNode @_unmask {
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
    rating
    completedAt
    status
    isDeleted
    isProtected
    count
    generationType
    model {
      id
      name
      type
    }
    vae
    nanoid
    estimatedSeconds
    controlNetControlMode
    controlNetEnabled
    controlNetGuidanceEnd
    controlNetGuidanceStart
    controlNetPixelPerfect
    controlNetProcessorRes
    controlNetResizeMode
    controlNetThresholdA
    controlNetThresholdB
    controlNetWeight
    controlNetModule
    controlNetModel
    controlNetSaveDetectedMap
    controlNetHrOption
    upscaleSize
    imageUrl
    thumbnailUrl
  }`,
)
