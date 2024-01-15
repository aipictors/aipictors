import { gql } from "@/graphql/__generated__"

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
