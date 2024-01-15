import { gql } from "@/graphql/__generated__"

export const viewerUserQuery = gql(`
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
`)
