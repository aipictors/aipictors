import { gql } from "@apollo/client"

export default gql`
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
