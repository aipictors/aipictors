import { gql } from "@/graphql/__generated__"

export const deleteReservedImageGenerationTasksMutation = gql(`
  mutation DeleteReservedImageGenerationTasks {
    deleteReservedImageGenerationTasks {
      ...ImageReservedGenerationTaskFields
    }
  }
`)
