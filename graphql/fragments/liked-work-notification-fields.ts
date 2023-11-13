import { gql } from "@apollo/client"

export default gql`
  fragment LikedWorkNotificationFields on LikedWorkNotificationNode {
    id
    createdAt
    isAnonymous
    work {
      ...PartialWorkFields
    }
    user {
      ...PartialUserFields
    }
  }
`
