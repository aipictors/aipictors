import { gql } from "@apollo/client"

export default gql`
  fragment WorkAwardNotificationFields on WorkAwardNotificationNode {
    id
    createdAt
    message
    work {
      ...PartialWorkFields
    }
  }
`
