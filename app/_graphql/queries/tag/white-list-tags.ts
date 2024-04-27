import { gql } from "@/_graphql/__generated__"

export const whiteListTagsQuery = gql(`
  query WhiteListTags($where: WhiteListTagsInput!) {
    whiteListTags(where: $where) {
      ...PartialTagFields
    }
  }
`)
