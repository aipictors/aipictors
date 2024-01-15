import { gql } from "@/graphql/__generated__"

export const hotWorksQuery = gql(`
  query HotWorks {
    hotWorks {
      ...PartialWorkFields
    }
  }
`)
