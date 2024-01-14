import { gql } from "@apollo/client"

export const deleteFolderWorkMutation = gql`
  mutation DeleteFolderWork($input: DeleteFolderWorkInput!) {
    deleteFolderWork(input: $input) {
      id
    }
  }
`
