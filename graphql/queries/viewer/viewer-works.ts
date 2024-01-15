import { gql } from "@/graphql/__generated__"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"

export const viewerWorksQuery = gql(`
  query ViewerWorks($offset: Int!, $limit: Int!) {
    viewer {
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
