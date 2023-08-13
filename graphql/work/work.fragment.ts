import { gql } from "@apollo/client"

export const WorkFields = gql`
  fragment WorkFields on WorkNode {
    id
    title
  }
`
