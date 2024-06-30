import { graphql } from "gql.tada"

export const imageGenerationResultFieldsFragment = graphql(
  `fragment ImageGenerationResultFields on ImageGenerationResultNode @_unmask {
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
    isProtected
    generationType
    model {
      id
      name
      type
    }
    vae
    nanoid
    status
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
