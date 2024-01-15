import { gql } from "@/graphql/__generated__"

export const viewerMutedTagsQuery = gql(`
  query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialTagFields
      }
    }
  }
`)
