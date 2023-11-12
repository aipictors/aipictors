import { gql } from "@apollo/client"

export default gql`
  mutation CreateImageGenerationTask($input: CreateImageGenerationTaskInput!) {
    createImageGenerationTask(input: $input) {
      ...ImageGenerationTaskFields
    }
  }
`
