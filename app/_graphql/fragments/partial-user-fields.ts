import { graphql } from "gql.tada"

export const partialUserFieldsFragment = graphql(
  `fragment PartialUserFields on UserNode @_unmask {
    id
    login
    name
    iconUrl
    isFollowee
    isFollower
    iconUrl
  }`,
)
