import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerFavoritedImageGenerationModelsQuery = graphql(
  `query ViewerFavoritedImageGenerationModels {
    viewer {
      favoritedImageGenerationModels {
        id
        name
        type
      }
    }
  }`,
)
