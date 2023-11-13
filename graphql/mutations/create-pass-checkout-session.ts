import { gql } from "@apollo/client"

export default gql`
  mutation CreatePassCheckoutSession($input: CreatePassCheckoutSessionInput!) {
    createPassCheckoutSession(input: $input)
  }
`
