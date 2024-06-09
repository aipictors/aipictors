import { graphql } from "gql.tada"

export const createAccountMutation = graphql(
  `mutation CreateAccount($input: CreateAccountInput!) {
    createAccount(input: $input) {
      id
    }
  }`,
)
