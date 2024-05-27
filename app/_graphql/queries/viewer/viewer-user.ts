import { gql } from "@/_graphql/__generated__"

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
        followCount
        iconImage {
          id
          downloadURL
        }
        headerImage {
          id
          downloadURL
        }
        webFcmToken
        generatedCount
        promptonUser {
          id
          name
        }
      }
    }
  }
`)
