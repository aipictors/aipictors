import { PartialMutedTagFieldsFragment } from "@/_graphql/fragments/partial-muted-tag-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのミュートしたタグ
 */
export const viewerMutedTagsQuery = graphql(
  `query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialMutedTagFields
      }
    }
  }`,
  [PartialMutedTagFieldsFragment],
)
