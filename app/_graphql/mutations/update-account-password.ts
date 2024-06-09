import { graphql } from "gql.tada"

export const updateAccountPasswordMutation = graphql(
  `mutation UpdateAccountPassword($input: UpdateAccountPasswordInput!) {
    updateAccountPassword(input: $input) {
      id
    }
  }`,
)
