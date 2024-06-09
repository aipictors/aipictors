import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

/**
 * 画像生成のタスク
 */
export const imageGenerationTaskQuery = graphql(
  `query ImageGenerationTask($id: ID!) {
    imageGenerationTask(id: $id) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
