import { gql } from "@apollo/client"

export default gql`
  query ViewerWorks($offset: Int!, $limit: Int!) {
    viewer {
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
