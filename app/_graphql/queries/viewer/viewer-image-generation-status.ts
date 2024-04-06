import { gql } from "@/_graphql/__generated__"

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
      inProgressImageGenerationTasksCost
      inProgressImageGenerationReservedTasksCount
      remainingImageGenerationTasksTotalCount
      availableImageGenerationMaxTasksCount
      imageGenerationWaitCount
      availableImageGenerationLoraModelsCount
      availableConsecutiveImageGenerationsCount
    }
  }
`)
