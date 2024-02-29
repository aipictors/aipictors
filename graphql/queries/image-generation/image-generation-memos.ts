import { gql } from "@/graphql/__generated__"

/**
 * 画像生成メモの一覧を取得する
 */
export const imageGenerationMemosQuery = gql(`
  query ImageGenerationMemos($offset: Int!, $limit: Int!, $orderBy: ImageGenerationMemoOrderBy) {
    imageGenerationMemos(offset: $offset, limit: $limit, orderBy: $orderBy) {
      ...ImageGenerationMemoFields 
    }
  }
`)
