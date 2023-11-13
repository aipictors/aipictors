import { gql } from "@apollo/client"

export default gql`
  mutation UpdateAccountPassword($input: UpdateAccountPasswordInput!) {
    updateAccountPassword(input: $input) {
      id
    }
  }
`
