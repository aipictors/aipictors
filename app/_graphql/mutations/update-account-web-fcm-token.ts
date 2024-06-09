import { graphql } from "gql.tada"

export const updateAccountWebFcmTokenMutation = graphql(
  `mutation UpdateAccountWebFcmToken($input: UpdateAccountWebFcmTokenInput!) {
    updateAccountWebFcmToken(input: $input) {
      id
    }
  }`,
)
