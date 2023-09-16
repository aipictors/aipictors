import { gql } from "@apollo/client"

export const FEED_HOT_WORKS = gql`
  query FeedHotWorks {
    hotWorks {
      ...PartialFeedWorkFields
      user {
        ...PartialUserFields
        viewer {
          id
          isFollower
          isFollowee
          isMuted
        }
      }
      viewer {
        id
        isLiked
        isBookmarked
      }
    }
  }
`
