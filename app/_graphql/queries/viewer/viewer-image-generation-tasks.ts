import { imageGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-task-field"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationTasksQuery = graphql(
  `query ViewerImageGenerationTasks($offset: Int!, $limit: Int!, $where: ImageGenerationTasksWhereInput) {
    viewer {
      imageGenerationTasks(offset: $offset, limit: $limit, where: $where) {
        ...ImageGenerationTaskFields
      }
    }
  }`,
  [imageGenerationTaskFieldsFragment],
)
