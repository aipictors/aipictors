import { gql } from "@/graphql/__generated__"
import { messageThreadFieldsFragment } from "@/graphql/fragments/message-thread-fields"

export const messageThreadQuery = gql(`
  query MessageThread($threadId: ID!) {
    viewer {
      messageThread(threadId: $threadId) {
        ...MessageThreadFields
      }
    }
  }
`)
