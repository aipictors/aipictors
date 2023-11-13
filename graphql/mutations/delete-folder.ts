import { gql } from "@apollo/client"

export default gql`
  mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }
`
