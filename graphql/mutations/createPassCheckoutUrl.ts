import { gql } from "@apollo/client"

export const CREATE_PASS_CHECKOUT_URL = gql`
  mutation CreatePassCheckoutURL {
    createPassCheckoutURL
  }
`
