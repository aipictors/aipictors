import { gql } from "@apollo/client"

export const promptCategoriesQuery = gql`
  query PromptCategories {
    promptCategories {
      id
      name
      prompts {
        id
        name
        words
      }
    }
  }
`
