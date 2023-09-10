import { gql } from "@apollo/client"

export const ViewerPassSubscription = gql`
  query ViewerPassSubscription {
    viewer {
      subscriptionURL
      passSubscription {
        ...SubscriptionFields
      }
    }
  }
`
