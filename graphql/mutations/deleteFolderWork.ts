import { gql } from "@apollo/client"

export const DELETE_FOLDER_WORK = gql`
  mutation DeleteFolderWork($input: DeleteFolderWorkInput!) {
    deleteFolderWork(input: $input) {
      id
    }
  }
`
