import { gql } from "@apollo/client"

export default gql`
  query ViewerImageGenerationTasks($offset: Int!, $limit: Int!) {
    viewer {
      imageGenerationTasks(offset: $offset, limit: $limit) {
        ...ImageGenerationTaskFields
      }
    }
  }
`
