import { gql } from "@/_graphql/__generated__"

export const negativePromptCategoriesQuery = gql(`
  query NegativePromptCategories {
    negativePromptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }
`)
