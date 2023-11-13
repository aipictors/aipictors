import { gql } from "@apollo/client"

export default gql`
  query ViewerMessageThreads($offset: Int!, $limit: Int!) {
    viewer {
      messageThreads(offset: $offset, limit: $limit) {
        ...MessageThreadFields
      }
    }
  }
`
