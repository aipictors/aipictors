import { gql } from "@apollo/client"

export const workFieldsFragment = gql`
  fragment WorkFields on WorkNode {
    id
    title
  }
`
