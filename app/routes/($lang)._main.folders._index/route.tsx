import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { workUserFieldsFragment } from "@/graphql/fragments/work-user-fields"
import { graphql } from "gql.tada"

export default function Route() {
  return null
}

export const folderQuery = graphql(
  `query Folder($id: ID!) {
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
  }`,
  [workUserFieldsFragment],
)

export const folderWorksQuery = graphql(
  `query FolderWorks($folderId: ID!, $offset: Int!, $limit: Int!) {
    folder(id: $folderId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
