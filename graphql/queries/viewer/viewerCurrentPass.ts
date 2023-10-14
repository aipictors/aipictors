import { gql } from "@apollo/client"

export const VIEWER_CURRENT_PASS = gql`
  query ViewerPassSubscription {
    viewer {
      customerPortalUrl
      currentPass {
        ...PassFields
      }
    }
  }
`
