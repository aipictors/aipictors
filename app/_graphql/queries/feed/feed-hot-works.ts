import { gql } from "@/_graphql/__generated__"

export const feedHotWorksQuery = gql(`
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
`)
