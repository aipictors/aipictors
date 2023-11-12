import { gql } from "@apollo/client"

export default gql`
  fragment WorkFields on WorkNode {
    id
    title
  }
`
