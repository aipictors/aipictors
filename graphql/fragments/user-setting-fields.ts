import { gql } from "@/graphql/__generated__"

export const userSettingFieldsFragment = gql(`
  fragment UserSettingFields on UserSettingNode {
    userId
    favoritedImageGenerationModelIds
  }
`)
