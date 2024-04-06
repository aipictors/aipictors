import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザの決済履歴
 */
export const viewerPaymentsQuery = gql(`
  query ViewerPayments {
    viewer {
      payments {
        ...PaymentFields
      }
    }
  }
`)
