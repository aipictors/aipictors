import { gql } from "@apollo/client"

export default gql`
  query HotWorks {
    hotWorks {
      ...PartialWorkFields
    }
  }
`
