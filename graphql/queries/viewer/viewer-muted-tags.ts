import { gql } from "@apollo/client"

export default gql`
  query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialTagFields
      }
    }
  }
`
