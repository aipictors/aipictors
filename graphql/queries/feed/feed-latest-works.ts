import { gql } from "@/graphql/__generated__"
import { partialFeedWorkFieldsFragment } from "@/graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"

export const feedLatestWorksQuery = gql(`
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
`)
