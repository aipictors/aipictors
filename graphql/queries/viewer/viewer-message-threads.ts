import { messageThreadFieldsFragment } from "@/graphql/fragments/message-thread-fields"
import { gql } from "@apollo/client"

export const viewerMessageThreadsQuery = gql`
  ${messageThreadFieldsFragment}
  query ViewerMessageThreads($offset: Int!, $limit: Int!) {
    viewer {
      messageThreads(offset: $offset, limit: $limit) {
        ...MessageThreadFields
      }
    }
  }
`
