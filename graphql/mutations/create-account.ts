import { gql } from "@apollo/client"

export const createAccountMutation = gql`
  mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
    }
  }
`
