import { gql } from "@apollo/client"

export default gql`
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
