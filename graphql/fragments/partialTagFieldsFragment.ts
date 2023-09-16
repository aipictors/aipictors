import { gql } from "@apollo/client"

export const PARTIAL_TAG_FIELDS = gql`
  fragment PartialTagFields on TagNode {
    id
    name
  }
`
