import { gql } from "@/_graphql/__generated__"

export const userSettingQuery = gql(`
  query UserSetting {
    userSetting {
      ...UserSettingFields
    }
  }
`)
