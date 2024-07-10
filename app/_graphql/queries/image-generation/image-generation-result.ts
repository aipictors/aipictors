import { imageGenerationResultFieldsFragment } from "@/_graphql/fragments/image-generation-result-field"
import { graphql } from "gql.tada"

/**
 * 画像生成の結果
 */
export const imageGenerationResultQuery = graphql(
  `query ImageGenerationResult($id: ID!) {
    imageGenerationResult(id: $id) {
      ...ImageGenerationResultFields
    }
  }`,
  [imageGenerationResultFieldsFragment],
)
