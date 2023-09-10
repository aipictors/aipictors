import { gql } from "@apollo/client"

export const ViewerSubscriptions = gql`
  query ViewerSubscriptions {
    viewer {
      subscriptionURL
      subscriptions {
        ...SubscriptionFields
      }
    }
  }
`
