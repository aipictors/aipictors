import { gql } from "@apollo/client"

export const USER_FIELDS = gql`
  fragment UserFields on UserNode {
    id
    biography
    login
    name
    receivedLikesCount
    receivedViewsCount
    awardsCount
    followersCount
    iconImage {
      id
      downloadURL
    }
    headerImage {
      id
      downloadURL
    }
  }
`
