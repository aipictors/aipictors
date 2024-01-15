import { gql } from "@/graphql/__generated__"

export const viewerMutedUsersQuery = gql(`
  query ViewerMutedUsers($offset: Int!, $limit: Int!) {
    viewer {
      mutedUsers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`)
