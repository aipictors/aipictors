import { gql } from "@/_graphql/__generated__"

export const hotSensitiveTagsQuery = gql(`
  query HotSensitiveTags {
    hotSensitiveTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }
`)
