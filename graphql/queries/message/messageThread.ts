import { gql } from "@apollo/client"

export const MESSAGE_THREAD = gql`
  query MessageThread($threadId: ID!) {
    viewer {
      messageThread(threadId: $threadId) {
        ...MessageThreadFields
      }
    }
  }
`
