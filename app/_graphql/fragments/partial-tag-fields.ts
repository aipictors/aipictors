import { gql } from "@/_graphql/__generated__"

export const partialTagFieldsFragment = gql(`
  fragment PartialTagFields on TagNode {
    id
    name
  }
`)
