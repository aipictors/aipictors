import { gql } from "@apollo/client"

export const HOT_WORKS = gql`
  query HotWorks {
    hotWorks {
      ...PartialWorkFields
    }
  }
`
