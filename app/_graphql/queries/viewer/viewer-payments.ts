import { paymentFieldsFragment } from "@/_graphql/fragments/payment-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの決済履歴
 */
export const viewerPaymentsQuery = graphql(
  `query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }`,
  [paymentFieldsFragment],
)
