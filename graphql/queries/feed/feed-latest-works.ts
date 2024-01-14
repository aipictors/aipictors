import { partialFeedWorkFieldsFragment } from "@/graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const feedLatestWorksQuery = gql`
  ${partialFeedWorkFieldsFragment}
  ${partialUserFieldsFragment}
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
