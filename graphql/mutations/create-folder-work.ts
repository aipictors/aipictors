import { gql } from "@apollo/client"

export const createFolderWorkMutation = gql`
  mutation CreateFolderWork($input: CreateFolderWorkInput!) {
    createFolderWork(input: $input) {
      id
    }
  }
`
