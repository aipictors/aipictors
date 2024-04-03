import { gql } from "@/graphql/__generated__"

export const loginWithWordPressTokenMutation = gql(`
  mutation LoginWithWordPressToken($input: LoginWithWordPressTokenInput!) {
    loginWithWordPressToken(input: $input) {
      token
    }
  }
`)
