import { gql } from "@apollo/client"

export default gql`
  fragment MessageFields on MessageNode {
    id
    createdAt
    text
    isRead
    isViewer
  }
`
