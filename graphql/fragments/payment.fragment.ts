import { gql } from "@apollo/client"

export const PAYMENT_FIELDS = gql`
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
