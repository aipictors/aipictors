import { gql } from "@/graphql/__generated__"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"

export const viewerMutedUsersQuery = gql(`
  query ViewerMutedUsers($offset: Int!, $limit: Int!) {
    viewer {
      mutedUsers(offset: $offset, limit: $limit) {
        ...PartialUserFields
      }
    }
  }
`)
