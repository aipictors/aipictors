import { gql } from "@/_graphql/__generated__"

/**
 * LINE認証URL
 */
export const verificationUrlQuery = gql(`
  query VerificationUrl {
    viewer {
        verificationUrl
    }
  }
`)
