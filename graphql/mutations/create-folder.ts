import { gql } from "@apollo/client"

export default gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`
