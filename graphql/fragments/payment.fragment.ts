import { gql } from "@apollo/client"

export const PaymentFields = gql`
  fragment PaymentFields on PaymentNode {
    id
    type
    createdAt
    amount
    isRefunded
    stripePaymentIntentId
    subscription {
      id
      type
    }
  }
`
