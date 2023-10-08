import { gql } from "@apollo/client"

export const VIEWER_MESSAGE_THREADS = gql`
  query ViewerMessageThreads($offset: Int!, $limit: Int!) {
    viewer {
      messageThreads(offset: $offset, limit: $limit) {
        ...MessageThreadFields
      }
    }
  }
`
