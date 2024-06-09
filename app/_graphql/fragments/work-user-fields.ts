import { graphql } from "gql.tada"

export const workUserFieldsFragment = graphql(
  `fragment WorkUserFields on UserNode @_unmask {
    id
    name
    login
    iconImage {
      id
      downloadURL
    }
  }`,
)
