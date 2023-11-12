import { gql } from "@apollo/client"

export default gql`
  query ViewerMutedUsers($offset: Int!, $limit: Int!) {
    viewer {
      mutedUsers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`
