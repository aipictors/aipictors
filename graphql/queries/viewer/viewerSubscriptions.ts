import { gql } from "@apollo/client"

export const VIEWER_SUBSCRIPTIONS = gql`
  query ViewerSubscriptions {
    viewer {
      subscriptionURL
      subscriptions {
        ...SubscriptionFields
      }
    }
  }
`
