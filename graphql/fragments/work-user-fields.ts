import { gql } from "@apollo/client"

export default gql`
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
