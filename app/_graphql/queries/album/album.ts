import { workUserFieldsFragment } from "@/_graphql/fragments/work-user-fields"
import { graphql } from "gql.tada"

export const albumQuery = graphql(
  `query Album($id: ID!) {
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
      thumbnailImageURL
      slug
      worksCount
      workIds
    }
  }`,
  [workUserFieldsFragment],
)
