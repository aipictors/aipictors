import { gql } from "@apollo/client"

export const VIEWER_PASS_SUBSCRIPTION = gql`
  query ViewerPassSubscription {
    viewer {
      subscriptionURL
      passSubscription {
        ...SubscriptionFields
      }
    }
  }
`
