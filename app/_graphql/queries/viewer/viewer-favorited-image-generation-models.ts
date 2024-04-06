import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerFavoritedImageGenerationModelsQuery = gql(`
  query ViewerFavoritedImageGenerationModels {
    viewer {
      favoritedImageGenerationModels {
        id
        name
        type
      }
    }
  }
`)
