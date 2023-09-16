import { gql } from "@apollo/client"

export const UPDATE_ACCOUNT_PASSWORD = gql`
  mutation UpdateAccountPassword($input: UpdateAccountPasswordInput!) {
    updateAccountPassword(input: $input) {
      id
    }
  }
`
