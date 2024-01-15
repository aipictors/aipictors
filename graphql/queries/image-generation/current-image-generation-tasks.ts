import { gql } from "@/graphql/__generated__"

export const currentImageGenerationTasksQuery = gql(`
  query CurrentImageGenerationTasks {
    viewer {
      currentImageGenerationTasks {
        ...ImageGenerationTaskFields
      }
    }
  }
`)
