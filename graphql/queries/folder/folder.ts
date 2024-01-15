import { gql } from "@/graphql/__generated__"

export const folderQuery = gql(`
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
`)
