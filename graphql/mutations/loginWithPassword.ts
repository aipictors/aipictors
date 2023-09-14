import { gql } from "@apollo/client"

export const LoginWithPassword = gql`
  mutation LoginWithPassword($input: LoginWithPasswordInput!) {
    loginWithPassword(input: $input) {
      token
    }
  }
`
