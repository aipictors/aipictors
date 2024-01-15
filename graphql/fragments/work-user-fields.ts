import { gql } from "@apollo/client"

export const workUserFieldsFragment = gql`
  fragment WorkUserFields on UserNode {
    id
    name
    login
    iconImage {
      id
      downloadURL
    }
  }
`
