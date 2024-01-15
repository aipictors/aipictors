import { gql } from "@/graphql/__generated__"

export const viewerImageGenerationTasksQuery = gql(`
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!) {
    viewer {
      imageGenerationTasks(offset: $offset, limit: $limit) {
        ...ImageGenerationTaskFields
      }
    }
  }
`)
