import { graphql } from "gql.tada"

export const PartialMutedTagFieldsFragment = graphql(
  `fragment PartialMutedTagFields on MutedTagNode @_unmask {
    id
    name
  }`,
)
