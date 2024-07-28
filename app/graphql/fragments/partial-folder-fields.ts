import { graphql } from "gql.tada"

export const partialFolderFieldsFragment = graphql(
  `fragment PartialFolderFields on FolderNode @_unmask {
    id
    title
    rating
    description
    thumbnailImageURL
  }`,
)
