import { gql } from "@/graphql/__generated__"
import { partialFeedWorkFieldsFragment } from "@/graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"

export const viewerFeedWorksQuery = gql(`
  query ViewerFeedWorks($offset: Int!, $limit: Int!) {
    viewer {
      feedWorks(offset: $offset, limit: $limit) {
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
  }
`)
