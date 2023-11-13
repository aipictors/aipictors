import { gql } from "@apollo/client"

export default gql`
  mutation DeleteFolderWork($input: DeleteFolderWorkInput!) {
    deleteFolderWork(input: $input) {
      id
    }
  }
`
