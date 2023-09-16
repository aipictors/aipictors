import { gql } from "@apollo/client"

export const WORK_USER_FIELDS = gql`
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
