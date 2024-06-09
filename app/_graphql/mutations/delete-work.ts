import { graphql } from "gql.tada"

export const deleteWorkMutation = graphql(
  `mutation DeleteWork($input: DeleteWorkInput!) {
    deleteWork(input: $input) {
      id
    }
  }`,
)
