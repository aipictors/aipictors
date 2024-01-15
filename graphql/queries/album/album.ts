import { gql } from "@/graphql/__generated__"
import { workUserFieldsFragment } from "@/graphql/fragments/work-user-fields"

export const albumQuery = gql(`
  query Album($id: ID!) {
    album(id: $id) {
      id
      title
      description
      user {
        ...WorkUserFields
        isFollowee
        isFollowee
        isMuted
      }
      createdAt
      isSensitive
      thumbnailImage {
        id
        downloadURL
      }
    }
  }
`)
