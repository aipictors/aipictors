import { gql } from "@apollo/client"

export const VIEWER_WORKS = gql`
  query ViewerWorks($offset: Int!, $limit: Int!) {
    viewer {
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
