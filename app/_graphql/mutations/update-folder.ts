import { graphql } from "gql.tada"

export const updateFolderMutation = graphql(
  `mutation UpdateFolder($input: UpdateFolderInput!) {
    updateFolder(input: $input) {
      id
      title
      description
    }
  }`,
)
