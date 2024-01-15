import { gql } from "@apollo/client"

export const passFieldsFragment = gql`
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
    price
  }
`
