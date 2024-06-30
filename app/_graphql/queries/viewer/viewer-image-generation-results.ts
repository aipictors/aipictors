import { imageGenerationResultFieldsFragment } from "@/_graphql/fragments/image-generation-result-field"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationResultsQuery = graphql(
  `query ViewerImageGenerationResults($offset: Int!, $limit: Int!, $where: ImageGenerationResultsWhereInput) {
    viewer {
      imageGenerationResults(offset: $offset, limit: $limit, where: $where) {
        ...ImageGenerationResultFields
      }
    }
  }`,
  [imageGenerationResultFieldsFragment],
)
