import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザのフィード
 */
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
