import { gql } from "@apollo/client"

export const ViewerPayments = gql`
  query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }
`
