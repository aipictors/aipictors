import { messageFieldsFragment } from "@/_graphql/fragments/message-fields"
import { partialUserFieldsFragment } from "@/_graphql/fragments/partial-user-fields"
import { graphql } from "gql.tada"

export const messageThreadFieldsFragment = graphql(
  `fragment MessageThreadFields on MessageThreadNode @_unmask {
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
  }`,
  [partialUserFieldsFragment, messageFieldsFragment],
)
