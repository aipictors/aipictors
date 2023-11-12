import { gql } from "@apollo/client"

export default gql`
  mutation UpdateFolder($input: UpdateFolderInput!) {
    updateFolder(input: $input) {
      id
      title
      description
    }
  }
`
