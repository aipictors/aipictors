import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const workAwardFieldsFragment = graphql(
  `fragment WorkAwardFields on WorkAwardNode @_unmask {
      id
      index
      dateText
      work {
        ...PartialWorkFields
      }
  }`,
  [partialWorkFieldsFragment],
)
