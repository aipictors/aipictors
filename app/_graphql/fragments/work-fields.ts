import { graphql } from "gql.tada"

export const workFieldsFragment = graphql(
  `fragment WorkFields on WorkNode @_unmask {
    id
    title
  }`,
)
