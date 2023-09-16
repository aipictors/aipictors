import { gql } from "@apollo/client"

export const UPDATE_ACCOUNT_LOGIN = gql`
  mutation UpdateAccountLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }
`
