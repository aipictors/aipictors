import { graphql } from "gql.tada"

export const partialStickerFieldsFragment = graphql(
  `fragment PartialStickerFields on StickerNode @_unmask {
    id
    title
    imageUrl
    userId
    downloadsCount
    usesCount
    likesCount
    accessType
  }`,
)
