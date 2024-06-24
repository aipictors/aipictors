import { graphql } from "gql.tada"

export const createRecommendedWorkMutation = graphql(
  `mutation CreateRecommendedWork($input: CreateRecommendedWorkInput!) {
    createRecommendedWork(input: $input) {
      id
    }
  }`,
)
