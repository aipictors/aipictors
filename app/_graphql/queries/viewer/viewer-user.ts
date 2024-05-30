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
        receivedLikesCount
        receivedViewsCount
        createdLikesCount
        createdViewsCount
        createdCommentsCount
        createdBookmarksCount
      }
    }
  }
`)
