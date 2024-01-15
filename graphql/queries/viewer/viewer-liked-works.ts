import { gql } from "@/graphql/__generated__"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"

export const viewerLikedWorksQuery = gql(`
  query ViewerLikedWorks($offset: Int!, $limit: Int!) {
    viewer {
      likedWorks(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
