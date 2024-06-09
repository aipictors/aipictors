import { graphql } from "gql.tada"

export const partialUserFieldsFragment = graphql(
  `fragment PartialUserFields on UserNode @_unmask {
    id
    login
    name
    iconImage {
      id
      downloadURL
    }
    isFollowee
    isFollower
    iconUrl
  }`,
)
