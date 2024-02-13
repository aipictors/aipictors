import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザの画像生成タスク
 */
export const viewerImageGenerationTasksQuery = gql(`
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!) {
    imageGenerationEngineStatus {
      normalTasksCount
      standardTasksCount
    }
    viewer {
      remainingImageGenerationTasksCount
      imageGenerationTasks(offset: $offset, limit: $limit) {
        ...ImageGenerationTaskFields
      }
      user {
        id
        nanoid
        hasSignedImageGenerationTerms
      }
      currentPass {
        ...PassFields
      }
    }
  }
`)
