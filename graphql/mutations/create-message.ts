import { messageFieldsFragment } from "@/graphql/fragments/message-fields"
import { gql } from "@apollo/client"

export const createMessageMutation = gql`
  ${messageFieldsFragment}
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageFields
    }
  }
`
