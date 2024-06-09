import { graphql } from "gql.tada"

export const createFolderWorkMutation = graphql(
  `mutation CreateFolderWork($input: CreateFolderWorkInput!) {
    createFolderWork(input: $input) {
      id
    }
  }`,
)
