import { gql } from "@apollo/client"

export const VIEWER_PAYMENTS = gql`
  query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }
`
