import { graphql } from "gql.tada"

/**
 * LINE認証URL
 */
export const verificationUrlQuery = graphql(
  `query VerificationUrl {
    viewer {
      verificationUrl
    }
  }`,
)
