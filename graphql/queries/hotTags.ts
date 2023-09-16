import { gql } from "@apollo/client"

export const HOT_TAGS = gql`
  query HotTags {
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }
`
