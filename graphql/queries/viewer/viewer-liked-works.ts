import { gql } from "@/graphql/__generated__"

export const viewerLikedWorksQuery = gql(`
  query ViewerLikedWorks($offset: Int!, $limit: Int!) {
    viewer {
      likedWorks(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
