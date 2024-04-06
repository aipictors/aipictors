import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザのミュートしたタグ
 */
export const viewerMutedTagsQuery = gql(`
  query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialTagFields
      }
    }
  }
`)
