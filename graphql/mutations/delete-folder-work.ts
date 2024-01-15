import { gql } from "@/graphql/__generated__"

export const deleteFolderWorkMutation = gql(`
  mutation DeleteFolderWork($input: DeleteFolderWorkInput!) {
    deleteFolderWork(input: $input) {
      id
    }
  }
`)
