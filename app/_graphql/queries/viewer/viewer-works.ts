import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの作品
 */
export const viewerWorksQuery = graphql(
  `query ViewerWorks($offset: Int!, $limit: Int!) {
    viewer {
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
