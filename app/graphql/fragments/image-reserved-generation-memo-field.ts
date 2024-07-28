import { graphql } from "gql.tada"

export const imageGenerationMemoFieldsFragment = graphql(
  `fragment ImageGenerationMemoFields on ImageGenerationMemoNode @_unmask {
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
  }`,
)
