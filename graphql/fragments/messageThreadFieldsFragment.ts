import { gql } from "@apollo/client"

export const MESSAGE_THREAD_FIELDS = gql`
  fragment MessageThreadFields on MessageThreadNode {
    id
    updatedAt
    latestMessage {
      ...MessageFields
      user {
        ...PartialUserFields
      }
    }
  }
`
