import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationTasksQuery = gql(`
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!, $where: ImageGenerationTasksWhereInput) {
    imageGenerationEngineStatus {
      normalTasksCount
      standardTasksCount
      normalPredictionGenerationSeconds
      standardPredictionGenerationSeconds
    }
    viewer {
      remainingImageGenerationTasksCount
      inProgressImageGenerationTasksCount
      remainingImageGenerationTasksTotalCount
      availableImageGenerationMaxTasksCount
      availableImageGenerationLoraModelsCount
      imageGenerationTasks(offset: $offset, limit: $limit, where: $where) {
        ...ImageGenerationTaskFields
      }
    }
  }
`)
