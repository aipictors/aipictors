import { gql } from "@apollo/client"

export default gql`
  query CurrentImageGenerationTasks {
    viewer {
      currentImageGenerationTasks {
        ...ImageGenerationTaskFields
      }
    }
  }
`
