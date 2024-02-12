import { gql } from "@/graphql/__generated__"

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
    }
  }
`)
