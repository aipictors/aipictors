import { graphql } from "gql.tada"

export const commentFieldsFragment = graphql(
  `fragment CommentFields on CommentNode @_unmask  {
    id
    createdAt
    text
    user {
      id
      name
      login
      iconUrl
      nanoid
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
)
