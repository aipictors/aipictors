import { imageGenerationMemoFieldsFragment } from "@/_graphql/fragments/image-reserved-generation-memo-field"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの画像生成メモ一覧
 */
export const viewerCurrentImageGenerationMemosQuery = graphql(
  `query ViewerCurrentImageGenerationMemos {
    viewer {
      currentImageGenerationMemos {
        ...ImageGenerationMemoFields
      }
    }
  }`,
  [imageGenerationMemoFieldsFragment],
)
