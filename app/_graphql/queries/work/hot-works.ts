import { gql } from "@/_graphql/__generated__"

export const hotWorksQuery = gql(`
  query HotWorks {
    hotWorks {
      ...PartialWorkFields
    }
  }
`)
