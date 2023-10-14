import { gql } from "@apollo/client"

export const VIEWER_CURRENT_PASS = gql`
  query ViewerCurrentPass {
    viewer {
      customerPortalUrl
      currentPass {
        ...PassFields
      }
    }
  }
`
