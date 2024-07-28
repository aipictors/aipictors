import { messageFieldsFragment } from "~/graphql/fragments/message-fields"
import { partialUserFieldsFragment } from "~/graphql/fragments/partial-user-fields"
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
