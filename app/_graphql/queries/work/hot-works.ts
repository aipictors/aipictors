import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const hotWorksQuery = graphql(
  `query HotWorks {
    hotWorks {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
