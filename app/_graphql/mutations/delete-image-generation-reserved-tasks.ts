import { gql } from "@/_graphql/__generated__"

export const deleteReservedImageGenerationTasksMutation = gql(`
  mutation DeleteReservedImageGenerationTasks {
    deleteReservedImageGenerationTasks {
      ...ImageReservedGenerationTaskFields
    }
  }
`)
