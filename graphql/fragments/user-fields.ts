import { gql } from "@apollo/client"

export const userFieldsFragment = gql`
  fragment UserFields on UserNode {
    id
    biography
    login
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
  }
`
