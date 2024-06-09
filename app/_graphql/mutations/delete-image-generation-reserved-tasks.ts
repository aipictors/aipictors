import { imageReservedGenerationTaskFieldsFragment } from "@/_graphql/fragments/image-generation-reserved-task-field"
import { graphql } from "gql.tada"

export const deleteReservedImageGenerationTasksMutation = graphql(
  `mutation DeleteReservedImageGenerationTasks {
    deleteReservedImageGenerationTasks {
      ...ImageReservedGenerationTaskFields
    }
  }`,
  [imageReservedGenerationTaskFieldsFragment],
)
