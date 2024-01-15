import { gql } from "@/graphql/__generated__"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"

export const hotWorksQuery = gql(`
  query HotWorks {
    hotWorks {
      ...PartialWorkFields
    }
  }
`)
