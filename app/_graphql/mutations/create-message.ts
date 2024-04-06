import { gql } from "@/_graphql/__generated__"

export const createMessageMutation = gql(`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      ...MessageFields
    }
  }
`)
