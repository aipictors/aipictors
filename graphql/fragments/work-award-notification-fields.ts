import { gql } from "@apollo/client"

export const workAwardNotificationFieldsFragment = gql`
  fragment WorkAwardNotificationFields on WorkAwardNotificationNode {
    id
    createdAt
    message
    work {
      ...PartialWorkFields
    }
  }
`
