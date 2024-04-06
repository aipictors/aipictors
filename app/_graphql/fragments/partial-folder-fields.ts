import { gql } from "@/_graphql/__generated__"

export const partialFolderFieldsFragment = gql(`
  fragment PartialFolderFields on FolderNode {
    id
    title
    rating
    description
    thumbnailImageURL
  }
`)
