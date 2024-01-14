import { partialFeedWorkFieldsFragment } from "@/graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const viewerFeedWorksQuery = gql`
  ${partialFeedWorkFieldsFragment}
  ${partialUserFieldsFragment}
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
`
