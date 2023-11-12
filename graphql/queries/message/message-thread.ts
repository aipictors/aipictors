import { gql } from "@apollo/client"

export default gql`
  query MessageThread($threadId: ID!) {
    viewer {
      messageThread(threadId: $threadId) {
        ...MessageThreadFields
      }
    }
  }
`
