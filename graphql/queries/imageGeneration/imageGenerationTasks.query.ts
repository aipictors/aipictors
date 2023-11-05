import { gql } from "@apollo/client"

export const VIEWER_IMAGE_GENERATION_TASKS = gql`
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!) {
    viewer {
      imageGenerationTasks(offset: $offset, limit: $limit) {
        ...ImageGenerationTaskFields
      }
    }
  }
`
