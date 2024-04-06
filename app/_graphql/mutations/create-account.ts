import { gql } from "@/_graphql/__generated__"

export const createAccountMutation = gql(`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
    }
  }
`)
