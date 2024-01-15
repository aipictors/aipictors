import { gql } from "@/graphql/__generated__"

export const viewerPaymentsQuery = gql(`
  query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }
`)
