import { workUserFieldsFragment } from "@/graphql/fragments/work-user-fields"
import { graphql } from "gql.tada"

export const commentFieldsFragment = graphql(
  `fragment CommentFields on CommentNode @_unmask  {
    id
    createdAt
    text
    user {
      ...WorkUserFields
    }
    sticker {
      id
      imageUrl
      title
      isDownloaded
      likesCount
      usesCount
      downloadsCount
      accessType
    }
  }`,
  [workUserFieldsFragment],
)
