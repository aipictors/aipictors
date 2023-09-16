import { gql } from "@apollo/client"

export const VIEWER_MUTED_TAGS = gql`
  query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialTagFields
      }
    }
  }
`
