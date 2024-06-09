import { graphql } from "gql.tada"

export const createFolderMutation = graphql(
  `mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }`,
)
