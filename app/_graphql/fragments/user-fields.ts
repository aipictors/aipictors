import { graphql } from "gql.tada"

export const userFieldsFragment = graphql(
  `fragment UserFields on UserNode @_unmask {
    id
    biography
    login
    nanoid
    name
    receivedLikesCount
    receivedViewsCount
    awardsCount
    followersCount
    worksCount
    iconUrl
    headerImageUrl
    webFcmToken
    isFollower
    isFollowee
    headerImageUrl
    biography
    receivedLikesCount
    createdLikesCount
    createdBookmarksCount
    promptonUser {
      id
    }
  }`,
)
