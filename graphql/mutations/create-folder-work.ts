import { gql } from "@apollo/client"

export default gql`
  mutation CreateFolderWork($input: CreateFolderWorkInput!) {
    createFolderWork(input: $input) {
      id
    }
  }
`
