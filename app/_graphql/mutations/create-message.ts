import { messageFieldsFragment } from "@/_graphql/fragments/message-fields"
import { graphql } from "gql.tada"

export const createMessageMutation = graphql(
  `mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageFields
    }
  }`,
  [messageFieldsFragment],
)
