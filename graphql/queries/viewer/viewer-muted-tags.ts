import { partialTagFieldsFragment } from "@/graphql/fragments/partial-tag-fields"
import { gql } from "@apollo/client"

export const viewerMutedTagsQuery = gql`
  ${partialTagFieldsFragment}
  query ViewerMutedTags($offset: Int!, $limit: Int!) {
    viewer {
      mutedTags(offset: $offset, limit: $limit) {
        ...PartialTagFields
      }
    }
  }
`
