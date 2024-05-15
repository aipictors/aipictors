import { gql } from "@/_graphql/__generated__"

export const updateAccountWebFcmTokenMutation = gql(`
  mutation UpdateAccountWebFcmToken($input: UpdateAccountWebFcmTokenInput!) {
    updateAccountWebFcmToken(input: $input) {
      id
    }
  }
`)
