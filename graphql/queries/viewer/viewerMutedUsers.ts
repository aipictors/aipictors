import { gql } from "@apollo/client"

export const VIEWER_MUTED_USERS = gql`
  query ViewerMutedUsers($offset: Int!, $limit: Int!) {
    viewer {
      mutedUsers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`
