import { graphql } from "gql.tada"

export const deleteFolderWorkMutation = graphql(
  `mutation DeleteFolderWork($input: DeleteFolderWorkInput!) {
    deleteFolderWork(input: $input) {
      id
    }
  }`,
)
