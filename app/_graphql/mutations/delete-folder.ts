import { graphql } from "gql.tada"

export const deleteFolderMutation = graphql(
  `mutation DeleteFolder($input: DeleteFolderInput!) {
    deleteFolder(input: $input) {
      id
    }
  }`,
)
