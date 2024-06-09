import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const popularWorksQuery = graphql(
  `query PopularWorks {
    popularWorks(where: {}) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
