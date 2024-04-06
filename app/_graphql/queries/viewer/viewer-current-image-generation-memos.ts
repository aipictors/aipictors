import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザの画像生成メモ一覧
 */
export const viewerCurrentImageGenerationMemosQuery = gql(`
query ViewerCurrentImageGenerationMemos {
  viewer {
    currentImageGenerationMemos {
      ...ImageGenerationMemoFields
    }
  }
}
`)
