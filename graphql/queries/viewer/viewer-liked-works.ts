import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const viewerLikedWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query ViewerLikedWorks($offset: Int!, $limit: Int!) {
    viewer {
      likedWorks(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
