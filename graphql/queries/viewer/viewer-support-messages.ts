import { gql } from "@apollo/client"

export default gql`
  query ViewerSupportMessages($offset: Int!, $limit: Int!) {
    viewer {
      supportMessages(offset: $offset, limit: $limit) {
        ...MessageFields
      }
    }
  }
`
