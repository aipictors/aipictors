import { gql } from "@apollo/client"

export const partialUserFieldsFragment = gql`
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
