import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const hotSensitiveTagsQuery = graphql(
  `query HotSensitiveTags {
    hotSensitiveTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
  }`,
  [partialTagFieldsFragment, partialWorkFieldsFragment],
)
