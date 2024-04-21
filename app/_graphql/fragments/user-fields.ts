import { gql } from "@/_graphql/__generated__"

export const userFieldsFragment = gql(`
  fragment UserFields on UserNode {
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
    iconImage {
      id
      downloadURL
    }
    headerImage {
      id
      downloadURL
    }
    isFollower
    isFollowee
  }
`)
