import { graphql } from "gql.tada"

export const subWorkFieldsFragment = graphql(
  `fragment SubWorkFields on SubWorkNode @_unmask {
    id
    imageUrl
  }`,
)
