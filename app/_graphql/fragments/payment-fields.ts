import { gql } from "@/_graphql/__generated__"

export const paymentFieldsFragment = gql(`
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
`)
