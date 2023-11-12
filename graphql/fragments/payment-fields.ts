import { gql } from "@apollo/client"

export default gql`
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
