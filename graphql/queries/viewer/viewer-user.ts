import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザ
 */
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
