import { graphql } from "gql.tada"

export const promptCategoriesQuery = graphql(
  `query PromptCategories {
    promptCategories {
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
