import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザのいいねした作品
 */
export const viewerLikedWorksQuery = gql(`
  query ViewerLikedWorks($offset: Int!, $limit: Int!) {
    viewer {
      likedWorks(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
