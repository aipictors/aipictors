import { gql } from "@/graphql/__generated__"

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
