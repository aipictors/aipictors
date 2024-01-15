import { gql } from "@/graphql/__generated__"

export const createFolderWorkMutation = gql(`
  mutation CreateFolderWork($input: CreateFolderWorkInput!) {
    createFolderWork(input: $input) {
      id
    }
  }
`)
