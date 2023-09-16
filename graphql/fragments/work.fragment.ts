import { gql } from "@apollo/client"

export const WORK_FIELDS = gql`
  fragment WorkFields on WorkNode {
    id
    title
  }
`
