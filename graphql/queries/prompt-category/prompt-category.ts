import { gql } from "@apollo/client"

export default gql`
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
