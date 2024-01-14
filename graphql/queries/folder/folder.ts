import { workUserFieldsFragment } from "@/graphql/fragments/work-user-fields"
import { gql } from "@apollo/client"

export const folderQuery = gql`
  ${workUserFieldsFragment}
  query Folder($id: ID!) {
    folder(id: $id) {
      id
      nanoid
      title
      isPrivate
      description
      user {
        ...WorkUserFields
        isFollowee
        isFollowee
        isMuted
      }
      createdAt
      rating
      thumbnailImageURL
    }
  }
`
