import { gql } from "@/graphql/__generated__"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"

export const bestWorksQuery = gql(`
  query BestWorks {
    bestWorks(where: {}) {
      ...PartialWorkFields
    }
  }
`)
