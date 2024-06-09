import { partialFeedWorkFieldsFragment } from "@/_graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

export const feedLatestWorksQuery = graphql(
  `query FeedLatestWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
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
  }`,
  [partialFeedWorkFieldsFragment, partialUserFieldsFragment],
)
