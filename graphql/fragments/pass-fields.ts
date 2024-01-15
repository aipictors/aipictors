import { gql } from "@/graphql/__generated__"

export const passFieldsFragment = gql(`
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
`)
