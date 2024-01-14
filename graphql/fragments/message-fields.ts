import { gql } from "@apollo/client"

export const messageFieldsFragment = gql`
  fragment MessageFields on MessageNode {
    id
    createdAt
    text
    isRead
    isViewer
  }
`
