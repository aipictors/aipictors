import { workUserFieldsFragment } from "@/_graphql/fragments/work-user-fields"
import { graphql } from "gql.tada"

export const userAlbumQuery = graphql(
  `query userAlbum($where: UserAlbumWhereInput) {
    userAlbum( where: $where) {
      id
      title
      description
      user {
        ...WorkUserFields
        isFollowee
        isFollowee
        isMuted
        nanoid
      }
      createdAt
      isSensitive
      thumbnailImageURL
      slug
      worksCount
      workIds
    }
  }`,
  [workUserFieldsFragment],
)
