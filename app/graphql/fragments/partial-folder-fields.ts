import { graphql } from "gql.tada"

export const partialFolderFieldsFragment = graphql(
  `fragment PartialFolderFields on FolderNode @_unmask {
    id
    nanoid
    title
    rating
    description
    thumbnailImageURL
  }`,
)
