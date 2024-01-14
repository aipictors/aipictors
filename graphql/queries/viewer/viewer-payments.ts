import { paymentFieldsFragment } from "@/graphql/fragments/payment-fields"
import { gql } from "@apollo/client"

export const viewerPaymentsQuery = gql`
  ${paymentFieldsFragment}
  query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }
`
