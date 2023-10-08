import { gql } from "@apollo/client"

export const MESSAGE_FIELDS = gql`
  fragment MessageFields on MessageNode {
    id
    createdAt
    text
    isRead
    isViewer
  }
`
