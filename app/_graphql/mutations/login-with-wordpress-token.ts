import { graphql } from "gql.tada"

export const loginWithWordPressTokenMutation = graphql(
  `mutation LoginWithWordPressToken($input: LoginWithWordPressTokenInput!) {
    loginWithWordPressToken(input: $input) {
      token
    }
  }`,
)
