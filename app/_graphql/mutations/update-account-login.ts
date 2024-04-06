import { gql } from "@/_graphql/__generated__"

export const updateAccountLoginMutation = gql(`
  mutation UpdateAccountLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }
`)
