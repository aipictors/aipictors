import { gql } from "@apollo/client"

export const FOLDER = gql`
  query Folder($id: ID!) {
    folder(id: $id) {
      id
      nanoid
      title
      isPrivate
      description
      user {
        ...WorkUserFields
        viewer {
          isFollowee
          isFollowee
          isMuted
        }
      }
      createdAt
      rating
      thumbnailImageURL
    }
  }
`
