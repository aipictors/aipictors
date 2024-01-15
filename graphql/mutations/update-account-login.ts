import { gql } from "@apollo/client"

export const updateAccountLoginMutation = gql`
  mutation UpdateAccountLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }
`
