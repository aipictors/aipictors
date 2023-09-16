import { gql } from "@apollo/client"

export const CONTRIBUTORS = gql`
  query Contributors {
    contributors {
      id
      types
      user {
        ...PartialUserFields
      }
    }
  }
`
