import { workUserFieldsFragment } from "@/graphql/fragments/work-user-fields"
import { gql } from "@apollo/client"

export const albumQuery = gql`
  ${workUserFieldsFragment}
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
`
