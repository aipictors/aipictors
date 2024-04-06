import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationTasksQuery = gql(`
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!, $where: ImageGenerationTasksWhereInput) {
    viewer {
      imageGenerationTasks(offset: $offset, limit: $limit, where: $where) {
        ...ImageGenerationTaskFields
      }
    }
  }
`)
