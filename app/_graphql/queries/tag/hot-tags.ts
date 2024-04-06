import { gql } from "@/_graphql/__generated__"

export const hotTagsQuery = gql(`
  query HotTags {
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }
`)
