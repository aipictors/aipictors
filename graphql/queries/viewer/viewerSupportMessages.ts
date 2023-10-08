import { gql } from "@apollo/client"

export const VIEWER_SUPPORT_MESSAGES = gql`
  query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }
`
