import { gql } from "@apollo/client"

export default gql`
  query HotTags {
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }
`
