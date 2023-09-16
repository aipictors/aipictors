import { gql } from "@apollo/client"

export const VIEWER_USER = gql`
  query ViewerUser {
    viewer {
      user {
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
    }
  }
`
