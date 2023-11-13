import { gql } from "@apollo/client"

export default gql`
  fragment FollowNotificationFields on FollowNotificationNode {
    id
    createdAt
    user {
      ...PartialUserFields
    }
  }
`
