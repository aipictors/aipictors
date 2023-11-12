import { gql } from "@apollo/client"

export default gql`
  fragment PartialTagFields on TagNode {
    id
    name
  }
`
