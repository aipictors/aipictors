import { gql } from "@/graphql/__generated__"

export const viewerWorksQuery = gql(`
  query ViewerWorks($offset: Int!, $limit: Int!) {
    viewer {
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
