import { gql } from "@/_graphql/__generated__"

export const loginWithPasswordMutation = gql(`
  mutation LoginWithPassword($input: LoginWithPasswordInput!) {
    loginWithPassword(input: $input) {
      token
    }
  }
`)
