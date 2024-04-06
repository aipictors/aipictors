import { gql } from "@/_graphql/__generated__"

export const workFieldsFragment = gql(`
  fragment WorkFields on WorkNode {
    id
    title
  }
`)
