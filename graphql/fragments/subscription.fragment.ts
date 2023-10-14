import { gql } from "@apollo/client"

export const PASS_FIELDS = gql`
  fragment PassFields on PassNode {
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
