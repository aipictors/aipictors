import { graphql } from "gql.tada"

export const createCustomerPortalSessionMutation = graphql(
  `mutation CreateCustomerPortalSession {
    createCustomerPortalSession
  }`,
)
