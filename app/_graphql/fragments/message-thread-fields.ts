import { gql } from "@/_graphql/__generated__"

export const messageThreadFieldsFragment = gql(`
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
`)
