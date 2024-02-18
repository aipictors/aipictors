import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationStatusQuery = gql(`
  query ViewerImageGenerationStatus {
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
    }
  }
`)
