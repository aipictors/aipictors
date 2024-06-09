import { graphql } from "gql.tada"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationStatusQuery = graphql(
  `query ViewerImageGenerationStatus {
    imageGenerationEngineStatus {
      normalTasksCount
      standardTasksCount
      normalPredictionGenerationWait
      standardPredictionGenerationWait
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
  }`,
)
