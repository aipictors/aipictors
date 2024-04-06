import { gql } from "@/_graphql/__generated__"

export const imageGenerationMemoFieldsFragment = gql(`
  fragment ImageGenerationMemoFields on ImageGenerationMemoNode {
    id
    nanoid
    userId
    title
    explanation
    prompts
    negativePrompts
    sampler
    model {
      id
      name
      type
    }
    vae
    seed
    steps
    scale
    clipSkip
    width
    height
    isDeleted
    createdAt
  }
`)
