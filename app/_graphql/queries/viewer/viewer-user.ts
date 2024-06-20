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
        iconUrl
        headerImageUrl
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
