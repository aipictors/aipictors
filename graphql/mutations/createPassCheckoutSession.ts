import { gql } from "@apollo/client"

export const CREATE_PASS_CHECKOUT_SESSION = gql`
  mutation CreatePassCheckoutSession($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }
`
