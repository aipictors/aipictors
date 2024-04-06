import { gql } from "@/_graphql/__generated__"

export const imageGenerationReservedTaskFieldsFragment = gql(`
  fragment ImageGenerationReservedTaskFields on ImageGenerationReservedTaskNode {
    id
    createdAt
    isDeleted
    isGenerated
    generationType
    model {
      id
      name
      type
    }
    vae
    prompt
    negativePrompt
    seed
    steps
    scale
    clipSkip
    sampler
    sizeType
    t2tImageUrl
    t2tMaskImageUrl
    t2tDenoisingStrengthSize
    t2tInpaintingFillSize
    token
    nanoid
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
  }
`)
