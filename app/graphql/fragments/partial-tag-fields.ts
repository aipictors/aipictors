import { graphql } from "gql.tada"

export const partialTagFieldsFragment = graphql(
  `fragment PartialTagFields on TagNode @_unmask {
    id
    name
  }`,
)
