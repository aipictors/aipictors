import { graphql } from "gql.tada"

export const paymentFieldsFragment = graphql(
  `fragment PaymentFields on PaymentNode @_unmask {
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
  }`,
)
