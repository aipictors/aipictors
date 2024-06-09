import { graphql } from "gql.tada"

export const negativePromptCategoriesQuery = graphql(
  `query NegativePromptCategories {
    negativePromptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }`,
)
