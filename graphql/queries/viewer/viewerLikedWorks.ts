import { gql } from "@apollo/client"

export const VIEWER_LIKED_WORKS = gql`
  query ViewerLikedWorks($offset: Int!, $limit: Int!) {
    viewer {
      likedWorks(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
