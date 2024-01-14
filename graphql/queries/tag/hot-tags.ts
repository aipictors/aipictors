import { partialTagFieldsFragment } from "@/graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const hotTagsQuery = gql`
  ${partialTagFieldsFragment}
  ${partialWorkFieldsFragment}
  query HotTags {
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }
`
