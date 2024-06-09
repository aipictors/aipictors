import { graphql } from "gql.tada"

export const updateAccountLoginMutation = graphql(
  `mutation UpdateAccountLogin($input: UpdateAccountLoginInput!) {
    updateAccountLogin(input: $input) {
      id
      login
    }
  }`,
)
