import { graphql } from "gql.tada"

export const passFieldsFragment = graphql(
  `fragment PassFields on PassNode @_unmask {
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
  }`,
)
