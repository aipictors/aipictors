import { imageGenerationTaskFieldsFragment } from "@/graphql/fragments/image-generation-task-field"
import { gql } from "@apollo/client"

export const viewerImageGenerationTasksQuery = gql`
  ${imageGenerationTaskFieldsFragment}
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!) {
    viewer {
      imageGenerationTasks(offset: $offset, limit: $limit) {
        ...ImageGenerationTaskFields
      }
    }
  }
`
