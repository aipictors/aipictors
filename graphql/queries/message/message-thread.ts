import { messageThreadFieldsFragment } from "@/graphql/fragments/message-thread-fields"
import { gql } from "@apollo/client"

export const messageThreadQuery = gql`
  ${messageThreadFieldsFragment}
  query MessageThread($threadId: ID!) {
    viewer {
      messageThread(threadId: $threadId) {
        ...MessageThreadFields
      }
    }
  }
`
