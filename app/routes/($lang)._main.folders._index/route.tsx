import { graphql } from "gql.tada"

export default function Route () {
  return null
}

export const FolderQuery = graphql(
  `query Folder($id: ID!) {
    folder(id: $id) {
      id
      nanoid
      title
      isPrivate
      description
      user {
        id
        isFollowee
        isFollowee
        isMuted
      }
      createdAt
      rating
      thumbnailImageURL
    }
  }`,
  [],
)

export const FolderWorksQuery = graphql(
  `query FolderWorks($folderId: ID!, $offset: Int!, $limit: Int!) {
    folder(id: $folderId) {
      id
      works(offset: $offset, limit: $limit) {
        id
      }
    }
  }`,
  [],
)
