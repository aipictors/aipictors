import { userSettingFieldsFragment } from "@/_graphql/fragments/user-setting-fields"
import { graphql } from "gql.tada"

export const userSettingQuery = graphql(
  `query UserSetting {
    userSetting {
      ...UserSettingFields
    }
  }`,
  [userSettingFieldsFragment],
)
