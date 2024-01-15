import { gql } from "@/graphql/__generated__"
import { messageFieldsFragment } from "@/graphql/fragments/message-fields"

export const createMessageMutation = gql(`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageFields
    }
  }
`)
