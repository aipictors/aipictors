import { gql } from "@/graphql/__generated__"

export const createPassCheckoutSessionMutation = gql(`
  mutation CreatePassCheckoutSession($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }
`)
