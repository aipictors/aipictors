import { gql } from "@apollo/client"

export const promptCategories = gql`
  query promptCategories {
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
