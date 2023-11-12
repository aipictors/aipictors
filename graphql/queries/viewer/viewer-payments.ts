import { gql } from "@apollo/client"

export default gql`
  query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }
`
