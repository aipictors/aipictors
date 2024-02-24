import { gql } from "@/graphql/__generated__"

export const updateRatingImageGenerationModelMutation = gql(`
  mutation UpdateRatingImageGenerationModel($input: UpdateRatingImageGenerationModelInput!) {
    updateRatingImageGenerationModel(input: $input) {
      ...UserSettingFields
    }
  }
`)
