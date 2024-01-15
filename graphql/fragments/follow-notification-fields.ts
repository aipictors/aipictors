import { gql } from "@apollo/client"

export const followNotificationFieldsFragment = gql`
  fragment FollowNotificationFields on FollowNotificationNode {
    id
    createdAt
    user {
      ...PartialUserFields
    }
  }
`
