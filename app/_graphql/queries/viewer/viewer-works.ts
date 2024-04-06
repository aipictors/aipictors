import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザの作品
 */
export const viewerWorksQuery = gql(`
  query ViewerWorks($offset: Int!, $limit: Int!) {
    viewer {
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
