import { gql } from "@apollo/client"

export const PARTIAL_USER_FIELDS = gql`
  fragment PartialUserFields on UserNode {
    id
    login
    name
    iconImage {
      id
      downloadURL
    }
  }
`
