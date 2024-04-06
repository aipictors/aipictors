import { gql } from "@/_graphql/__generated__"

export const messageFieldsFragment = gql(`
  fragment MessageFields on MessageNode {
    id
    createdAt
    text
    isRead
    isViewer
  }
`)
