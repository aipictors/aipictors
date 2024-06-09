import { imageGenerationMemoFieldsFragment } from "@/_graphql/fragments/image-reserved-generation-memo-field"
import { graphql } from "gql.tada"

/**
 * 画像生成メモの一覧を取得する
 */
export const imageGenerationMemosQuery = graphql(
  `query ImageGenerationMemos($offset: Int!, $limit: Int!, $orderBy: ImageGenerationMemoOrderBy) {
    imageGenerationMemos(offset: $offset, limit: $limit, orderBy: $orderBy) {
      ...ImageGenerationMemoFields
    }
  }`,
  [imageGenerationMemoFieldsFragment],
)
