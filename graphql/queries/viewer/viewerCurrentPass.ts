import { gql } from "@apollo/client"

export const VIEWER_CURRENT_PASS = gql`
  query ViewerCurrentPass {
    viewer {
      currentPass {
        ...PassFields
      }
    }
  }
`
