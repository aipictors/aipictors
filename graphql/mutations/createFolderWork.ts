import { gql } from "@apollo/client"

export const CREATE_FOLDER_WORK = gql`
  mutation CreateFolderWork($input: CreateFolderWorkInput!) {
    createFolderWork(input: $input) {
      id
    }
  }
`
