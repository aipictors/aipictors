import { graphql } from "gql.tada"

export const partialUserFieldsFragment = graphql(
  `fragment PartialUserFields on UserNode @_unmask {
    id
    nanoid
    login
    name
    iconUrl
    isFollowee
    isFollower
    iconUrl
  }`,
)
