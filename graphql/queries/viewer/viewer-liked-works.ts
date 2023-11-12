import { gql } from "@apollo/client"

export default gql`
  query ViewerLikedWorks($offset: Int!, $limit: Int!) {
    viewer {
      likedWorks(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
