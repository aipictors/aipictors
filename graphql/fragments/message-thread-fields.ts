import { gql } from "@apollo/client"

export const messageThreadFieldsFragment = gql`
  fragment MessageThreadFields on MessageThreadNode {
    id
    updatedAt
    recipient {
      ...PartialUserFields
    }
    latestMessage {
      ...MessageFields
      user {
        ...PartialUserFields
      }
    }
  }
`
