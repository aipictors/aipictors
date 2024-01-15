import { gql } from "@apollo/client"

export const paymentFieldsFragment = gql`
  fragment PaymentFields on PaymentNode {
    id
    type
    createdAt
    amount
    isRefunded
    stripePaymentIntentId
    pass {
      id
      type
    }
  }
`
