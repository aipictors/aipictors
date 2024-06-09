import { workUserFieldsFragment } from "@/_graphql/fragments/work-user-fields"
import { graphql } from "gql.tada"

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
