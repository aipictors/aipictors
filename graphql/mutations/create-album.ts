import { gql } from "@/graphql/__generated__"

export const createAlbumMutation = gql(`
  mutation CreateAlbum($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`)
