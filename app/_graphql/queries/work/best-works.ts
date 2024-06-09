import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const bestWorksQuery = graphql(
  `query BestWorks {
    bestWorks(where: {}) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
