import { gql } from "@apollo/client"

export default gql`
  query MessageThreadMessages($threadId: ID!, $offset: Int!, $limit: Int!) {
    viewer {
      messageThread(threadId: $threadId) {
        id
        ...MessageThreadFields
        messages(offset: $offset, limit: $limit) {
          ...MessageFields
        }
      }
    }
  }
`
