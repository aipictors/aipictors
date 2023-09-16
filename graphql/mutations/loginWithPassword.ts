import { gql } from "@apollo/client"

export const LOGIN_WITH_PASSWORD = gql`
  mutation LoginWithPassword($input: LoginWithPasswordInput!) {
    loginWithPassword(input: $input) {
      token
    }
  }
`
