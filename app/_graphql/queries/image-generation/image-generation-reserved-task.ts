import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

/**
 * 予約画像生成のタスク
 */
export const imageGenerationReservedTaskQuery = graphql(
  `query ImageGenerationReservedTask($id: ID!) {
    imageGenerationReservedTask(id: $id) {
      ...ImageGenerationTaskFields
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
