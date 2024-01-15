import { gql } from "@/graphql/__generated__"
import { messageThreadFieldsFragment } from "@/graphql/fragments/message-thread-fields"

export const viewerMessageThreadsQuery = gql(`
  query ViewerMessageThreads($offset: Int!, $limit: Int!) {
    viewer {
      messageThreads(offset: $offset, limit: $limit) {
        ...MessageThreadFields
      }
    }
  }
`)
