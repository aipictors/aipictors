import { graphql } from "gql.tada"

// 最低限必要なユーザー情報のみを取得するクエリ
export const viewerBasicUserQuery = graphql(
  `query ViewerBasicUser {
    viewer {
      id
      user {
        id
        login
        name
        iconUrl
      }
    }
  }`,
)

// ヘッダー表示に必要な基本情報のみ
export const userBasicSettingQuery = graphql(
  `query UserBasicSetting {
    userSetting {
      id
      preferenceRating
    }
  }`,
)
