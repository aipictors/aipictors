import { gql } from "@/_graphql/__generated__"

export const updateUserSettingMutation = gql(`
  mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      preferenceRating
    }
  }
`)
