import { gql } from "@/_graphql/__generated__"

export const imageGenerationTaskFieldsFragment = gql(`
  fragment ImageGenerationTaskFields on ImageGenerationTaskNode {
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
    imageFileName
    thumbnailImageFileName
    imageFileName
    thumbnailImageFileName
  }
`)
