import { gql } from "@apollo/client"

export default gql`
  query FeedLatestWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
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
