import { gql } from "@apollo/client"

export const SUBSCRIPTION_FIELDS = gql`
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
