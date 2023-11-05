import { gql } from "@apollo/client"

export const CURRENT_IMAGE_GENERATION_TASKS = gql`
  query CurrentImageGenerationTasks {
    viewer {
      currentImageGenerationTasks {
        ...ImageGenerationTaskFields
      }
    }
  }
`
