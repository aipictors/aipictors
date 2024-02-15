import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationTasksQuery = gql(`
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!, $rating: Int = null) {
    imageGenerationEngineStatus {
      normalTasksCount
      standardTasksCount
      normalPredictionGenerationSeconds
      standardPredictionGenerationSeconds
    }
    viewer {
      remainingImageGenerationTasksCount
      inProgressImageGenerationTasksCount
      imageGenerationTasks(offset: $offset, limit: $limit, rating: $rating) {
        ...ImageGenerationTaskFields
      }
    }
  }
`)
