import { gql } from "@/graphql/__generated__"

/**
 * ログイン中のユーザのミュートのユーザ
 */
export const viewerMutedUsersQuery = gql(`
  query ViewerMutedUsers($offset: Int!, $limit: Int!) {
    viewer {
      mutedUsers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`)
