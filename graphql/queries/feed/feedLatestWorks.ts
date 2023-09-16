import { gql } from "@apollo/client"

export const FEED_LATEST_WORKS = gql`
  query FeedLatestWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
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
