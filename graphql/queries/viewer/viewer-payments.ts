import { gql } from "@/graphql/__generated__"
import { paymentFieldsFragment } from "@/graphql/fragments/payment-fields"

export const viewerPaymentsQuery = gql(`
  query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }
`)
