import { gql } from "@apollo/client"

export const loginWithPasswordMutation = gql`
  mutation LoginWithPassword($input: LoginWithPasswordInput!) {
    loginWithPassword(input: $input) {
      token
    }
  }
`
