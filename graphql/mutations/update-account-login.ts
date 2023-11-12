import { gql } from "@apollo/client"

export default gql`
  mutation UpdateAccountLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }
`
