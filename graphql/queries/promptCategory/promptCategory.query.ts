import { gql } from "@apollo/client"

export const promptCategory = gql`
  query promptCategory {
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
