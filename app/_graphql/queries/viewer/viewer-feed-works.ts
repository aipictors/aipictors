import { partialFeedWorkFieldsFragment } from "@/_graphql/fragments/partial-feed-work-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのフィード
 */
export const viewerFeedWorksQuery = graphql(
  `query ViewerFeedWorks($offset: Int!, $limit: Int!) {
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
  }`,
  [partialFeedWorkFieldsFragment, partialUserFieldsFragment],
)
