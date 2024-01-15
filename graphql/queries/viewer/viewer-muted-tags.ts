import { gql } from "@/graphql/__generated__"
import { partialTagFieldsFragment } from "@/graphql/fragments/partial-tag-fields"

export const viewerMutedTagsQuery = gql(`
  query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialTagFields
      }
    }
  }
`)
