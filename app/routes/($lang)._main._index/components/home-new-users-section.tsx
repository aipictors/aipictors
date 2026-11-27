import { graphql } from "gql.tada"

/**
 * 新規クリエイター（トップの HomeNewCreators・右カラムの取り直し）で使うユーザーの項目
 */
export const HomeNewPostedUsersFragment = graphql(
  `fragment HomeNewPostedUsers on UserNode @_unmask {
    id
    iconUrl
    name
    login
  }`,
)
