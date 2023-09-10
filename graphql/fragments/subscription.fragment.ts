import { gql } from "@apollo/client"

export const SubscriptionFields = gql`
  fragment SubscriptionFields on SubscriptionNode {
    id
    type
    payment {
      id
      amount
      stripePaymentIntentId
    }
    isDisabled
    periodStart
    periodEnd
    trialPeriodStart
    trialPeriodEnd
    createdAt
  }
`
