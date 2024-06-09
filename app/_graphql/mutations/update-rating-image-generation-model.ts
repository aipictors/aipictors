import { userSettingFieldsFragment } from "@/_graphql/fragments/user-setting-fields"
import { graphql } from "gql.tada"

export const updateRatingImageGenerationModelMutation = graphql(
  `mutation UpdateRatingImageGenerationModel($input: UpdateRatingImageGenerationModelInput!) {
    updateRatingImageGenerationModel(input: $input) {
      ...UserSettingFields
    }
  }`,
  [userSettingFieldsFragment],
)
