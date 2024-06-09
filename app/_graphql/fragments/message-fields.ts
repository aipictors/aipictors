import { graphql } from "gql.tada"

export const messageFieldsFragment = graphql(
  `fragment MessageFields on MessageNode @_unmask {
    id
    createdAt
    text
    isRead
    isViewer
  }`,
)
