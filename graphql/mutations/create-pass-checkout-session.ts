import { gql } from "@apollo/client"

export const createPassCheckoutSessionMutation = gql`
  mutation CreatePassCheckoutSession($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }
`
