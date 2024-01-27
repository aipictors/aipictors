import { gql } from "@/graphql/__generated__"

export const signImageGenerationTermsMutation = gql(`
  mutation SignImageGenerationTerms($input: SignImageGenerationTermsInput!) {
    signImageGenerationTerms(input: $input) {
      id
    }
  }
`)
