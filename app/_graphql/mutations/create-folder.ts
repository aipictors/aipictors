import { gql } from "@/_graphql/__generated__"

export const createFolderMutation = gql(`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`)
