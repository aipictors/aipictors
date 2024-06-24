import { graphql } from "gql.tada"

export const deleteRecommendedWorkMutation = graphql(
  `mutation DeleteRecommendedWork($input: DeleteRecommendedWorkInput!) {
    deleteRecommendedWork(input: $input)
  }`,
)
