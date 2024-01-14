import { gql } from "@apollo/client"

export const updateAccountPasswordMutation = gql`
  mutation UpdateAccountPassword($input: UpdateAccountPasswordInput!) {
    updateAccountPassword(input: $input) {
      id
    }
  }
`
