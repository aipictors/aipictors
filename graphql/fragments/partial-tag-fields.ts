import { gql } from "@apollo/client"

export const partialTagFieldsFragment = gql`
  fragment PartialTagFields on TagNode {
    id
    name
  }
`
