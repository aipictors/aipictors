import { imageGenerationTaskFieldsFragment } from "@/graphql/fragments/image-generation-task-field"
import { gql } from "@apollo/client"

export const currentImageGenerationTasksQuery = gql`
  ${imageGenerationTaskFieldsFragment}
  query CurrentImageGenerationTasks {
    viewer {
      currentImageGenerationTasks {
        ...ImageGenerationTaskFields
      }
    }
  }
`
