import { graphql } from "gql.tada"

/**
 * ログイン中のユーザ
 */
export const viewerUserQuery = graphql(
  `query ViewerUser {
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
        iconUrl
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
  }`,
)
