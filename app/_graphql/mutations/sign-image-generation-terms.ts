import { graphql } from "gql.tada"

export const signImageGenerationTermsMutation = graphql(
  `mutation SignImageGenerationTerms($input: SignImageGenerationTermsInput!) {
    signImageGenerationTerms(input: $input) {
      id
    }
  }`,
)
