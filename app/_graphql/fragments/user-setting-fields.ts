import { graphql } from "gql.tada"

export const userSettingFieldsFragment = graphql(
  `fragment UserSettingFields on UserSettingNode @_unmask {
    userId
    favoritedImageGenerationModelIds
    preferenceRating
    featurePromptonRequest
  }`,
)
