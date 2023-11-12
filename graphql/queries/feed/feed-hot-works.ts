import { gql } from "@apollo/client"

export default gql`
  query FeedHotWorks {
    hotWorks {
      ...PartialFeedWorkFields
      user {
        ...PartialUserFields
        isFollower
        isFollowee
        isMuted
      }
      isLiked
      isInCollection
    }
  }
`
